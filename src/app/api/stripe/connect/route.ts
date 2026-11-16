import { NextResponse } from "next/server";
import {
  createOnboardingLink,
  createSellerAccount,
  deriveStatus,
  findSellerAccountByEmail,
  getBaseUrl,
  parseEmail,
  sellerHasListings,
  syncSellerAccount,
} from "@/lib/seller-accounts";

/** Starts (or resumes) Stripe onboarding for a seller email. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = parseEmail(body?.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    let account = await findSellerAccountByEmail(email);

    if (!account) {
      if (!(await sellerHasListings(email))) {
        return NextResponse.json(
          { error: "We couldn’t find any listings with that email. Create a listing first, then connect Stripe." },
          { status: 404 },
        );
      }
      account = await createSellerAccount(email);
    }

    account = await syncSellerAccount(account);
    if (deriveStatus(account) === "connected") {
      return NextResponse.json({ status: "connected" });
    }

    const url = await createOnboardingLink(account, getBaseUrl(req));
    return NextResponse.json({ status: "incomplete", url });
  } catch (err) {
    console.error("stripe connect failed", err);
    return NextResponse.json(
      { error: "We couldn’t start Stripe onboarding. Please try again." },
      { status: 502 },
    );
  }
}
