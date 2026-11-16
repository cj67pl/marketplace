import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ok = (note = "ok") => NextResponse.json({ received: true, note });

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  // The signature is computed over the exact raw body, so read it as text.
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        return await onCheckoutCompleted(event);
      case "checkout.session.expired":
        return await onCheckoutExpired(event);
      case "account.updated":
        return await onAccountUpdated(event);
      default:
        return ok("ignored");
    }
  } catch (err) {
    // 500 makes Stripe retry; every handler below is safe to run twice.
    console.error(`webhook ${event.type} failed`, err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}

async function onCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const db = getSupabaseAdmin();

  // The sandbox is shared: sessions that aren't ours simply aren't found.
  const { data: order, error } = await db
    .from("orders")
    .select("id, listing_id, status, stripe_account_id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) return ok("unknown order");
  if (event.account && order.stripe_account_id !== event.account) return ok("account mismatch");
  if (session.payment_status !== "paid") return ok("not paid yet");

  if (order.status !== "paid") {
    const paymentIntent =
      typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

    const { error: updateErr } = await db
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: paymentIntent,
        buyer_email: session.customer_details?.email ?? null,
      })
      .eq("id", order.id);

    if (updateErr?.code === "23505") {
      // Another order for this listing is already paid: this buyer paid for an item
      // that was sold first. Refund them (and the fee) and mark the order failed.
      await db.from("orders").update({ status: "failed" }).eq("id", order.id);
      if (paymentIntent) {
        await getStripe()
          .refunds.create(
            { payment_intent: paymentIntent, refund_application_fee: true },
            { stripeAccount: order.stripe_account_id },
          )
          .catch((e) => console.error("refund failed", e));
      }
      return ok("already sold, refunded");
    }
    if (updateErr) throw new Error(updateErr.message);
  }

  // Idempotent: only an available listing flips to sold, and re-running changes nothing.
  const { error: listingErr } = await db
    .from("listings")
    .update({ status: "sold" })
    .eq("id", order.listing_id)
    .eq("status", "available");
  if (listingErr) throw new Error(listingErr.message);
  return ok("paid");
}

async function onCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const { error } = await getSupabaseAdmin()
    .from("orders")
    .update({ status: "expired" })
    .eq("stripe_checkout_session_id", session.id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  return ok("expired");
}

async function onAccountUpdated(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;
  // Unknown accounts (other candidates' sellers) match no row and change nothing.
  const { error } = await getSupabaseAdmin()
    .from("seller_accounts")
    .update({
      details_submitted: !!account.details_submitted,
      charges_enabled: !!account.charges_enabled,
      payouts_enabled: !!account.payouts_enabled,
    })
    .eq("stripe_account_id", account.id);
  if (error) throw new Error(error.message);
  return ok("account synced");
}
