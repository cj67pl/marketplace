import { NextResponse } from "next/server";
import { getBaseUrl, isUuid } from "@/lib/seller-accounts";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** Stripe's "back" link: release the item right away instead of waiting for the session to expire. */
export async function GET(req: Request) {
  const base = getBaseUrl(req);
  const orderId = new URL(req.url).searchParams.get("order");
  if (!isUuid(orderId)) return NextResponse.redirect(base);

  try {
    const db = getSupabaseAdmin();
    const { data: order } = await db
      .from("orders")
      .select("id, listing_id, status, stripe_checkout_session_id, stripe_account_id")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return NextResponse.redirect(base);

    if (order.status === "pending") {
      try {
        await getStripe().checkout.sessions.expire(
          order.stripe_checkout_session_id,
          {},
          { stripeAccount: order.stripe_account_id },
        );
        await db.from("orders").update({ status: "expired" }).eq("id", order.id).eq("status", "pending");
      } catch (err) {
        // Already completed or expired; the webhook is the source of truth.
        console.error("cancel: could not expire session", err);
      }
    }
    return NextResponse.redirect(`${base}/item/${order.listing_id}`);
  } catch (err) {
    console.error("checkout cancel failed", err);
    return NextResponse.redirect(base);
  }
}
