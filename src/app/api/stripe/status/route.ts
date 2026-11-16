import { NextResponse } from "next/server";
import {
  deriveStatus,
  findSellerAccountByEmail,
  parseEmail,
  syncSellerAccount,
} from "@/lib/seller-accounts";

/** Returns only a status. Stripe account IDs never leave the server. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = parseEmail(body?.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const account = await findSellerAccountByEmail(email);
    if (!account) return NextResponse.json({ status: "not_connected" });
    return NextResponse.json({ status: deriveStatus(await syncSellerAccount(account)) });
  } catch (err) {
    console.error("stripe status failed", err);
    return NextResponse.json(
      { error: "We couldn’t check your Stripe status. Please try again." },
      { status: 502 },
    );
  }
}
