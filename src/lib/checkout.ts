import "server-only";
import { CURRENCY, platformFeeCents, toCents } from "@/lib/payments";
import { deriveStatus, findSellerAccountByEmail, isUuid } from "@/lib/seller-accounts";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; status: number; message: string };

const fail = (status: number, message: string): CheckoutResult => ({ ok: false, status, message });

/** Stripe's minimum charge for USD. */
const MIN_CENTS = 50;
/** Stripe requires at least 30 minutes; add a little headroom. */
const SESSION_MINUTES = 31;

/**
 * Creates a Stripe Checkout Session as a direct charge on the seller's connected
 * account, with the platform fee, and records a pending order.
 * Every value (price, seller, account) is read from Supabase, never from the browser.
 */
export async function createCheckout(listingId: unknown, baseUrl: string): Promise<CheckoutResult> {
  if (!isUuid(listingId)) return fail(400, "Invalid listing.");

  const db = getSupabaseAdmin();
  const stripe = getStripe();

  const { data: listing, error } = await db
    .from("listings")
    .select("id, title, price, seller_email, image_url, status")
    .eq("id", listingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!listing) return fail(404, "This listing no longer exists.");
  if (listing.status === "sold") return fail(409, "Sorry, this item has already been sold.");

  const seller = await findSellerAccountByEmail(listing.seller_email);
  if (!seller || deriveStatus(seller) !== "connected") {
    return fail(409, "This seller hasn’t set up online payments yet.");
  }

  const priceCents = toCents(listing.price);
  if (!Number.isFinite(priceCents) || priceCents < MIN_CENTS) {
    return fail(400, "This item can’t be bought online. The minimum price is $0.50.");
  }
  const feeCents = platformFeeCents(priceCents);

  // Already paid for?
  const { count: paidCount, error: paidErr } = await db
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listing.id)
    .eq("status", "paid");
  if (paidErr) throw new Error(paidErr.message);
  if ((paidCount ?? 0) > 0) return fail(409, "Sorry, this item has already been sold.");

  // Is another buyer in the middle of checking out? Free the item if their session lapsed.
  const { data: pending, error: pendingErr } = await db
    .from("orders")
    .select("id, stripe_checkout_session_id, stripe_account_id")
    .eq("listing_id", listing.id)
    .eq("status", "pending");
  if (pendingErr) throw new Error(pendingErr.message);
  for (const order of pending ?? []) {
    const session = await stripe.checkout.sessions.retrieve(
      order.stripe_checkout_session_id,
      {},
      { stripeAccount: order.stripe_account_id },
    );
    if (session.status === "open" || session.status === "complete") {
      return fail(409, "Someone else is checking out this item right now. Please try again in a few minutes.");
    }
    await db.from("orders").update({ status: "expired" }).eq("id", order.id);
  }

  const orderId = crypto.randomUUID();
  const image = listing.image_url?.startsWith("https://") ? [listing.image_url] : undefined;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: priceCents,
            product_data: { name: listing.title.slice(0, 250), images: image },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: feeCents,
        metadata: { order_id: orderId, listing_id: listing.id },
      },
      client_reference_id: orderId,
      metadata: { order_id: orderId, listing_id: listing.id },
      expires_at: Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60,
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/checkout/cancel?order=${orderId}`,
    },
    { stripeAccount: seller.stripe_account_id },
  );

  if (!session.url) {
    await stripe.checkout.sessions
      .expire(session.id, {}, { stripeAccount: seller.stripe_account_id })
      .catch(() => undefined);
    throw new Error("Stripe did not return a checkout URL.");
  }

  const { error: insertErr } = await db.from("orders").insert({
    id: orderId,
    listing_id: listing.id,
    seller_email: listing.seller_email,
    stripe_account_id: seller.stripe_account_id,
    stripe_checkout_session_id: session.id,
    price_cents: priceCents,
    application_fee_cents: feeCents,
    currency: CURRENCY,
    status: "pending",
  });
  if (insertErr) {
    await stripe.checkout.sessions
      .expire(session.id, {}, { stripeAccount: seller.stripe_account_id })
      .catch(() => undefined);
    throw new Error(insertErr.message);
  }

  return { ok: true, url: session.url };
}
