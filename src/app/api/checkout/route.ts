import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/checkout";
import { getBaseUrl } from "@/lib/seller-accounts";

/** Buy Now: creates a Stripe Checkout Session for one listing. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  try {
    const result = await createCheckout(body?.listingId, getBaseUrl(req));
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json(
      { error: "We couldn’t start checkout. Please try again." },
      { status: 502 },
    );
  }
}
