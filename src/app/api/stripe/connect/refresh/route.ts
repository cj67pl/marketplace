import { NextResponse } from "next/server";
import {
  createOnboardingLink,
  findSellerAccountById,
  getBaseUrl,
  isUuid,
} from "@/lib/seller-accounts";

/** Stripe sends sellers here when an onboarding link expired; issue a fresh one. */
export async function GET(req: Request) {
  const base = getBaseUrl(req);
  const sid = new URL(req.url).searchParams.get("sid");
  try {
    const account = isUuid(sid) ? await findSellerAccountById(sid) : null;
    if (!account) return NextResponse.redirect(`${base}/seller/connect?error=link`);
    return NextResponse.redirect(await createOnboardingLink(account, base));
  } catch (err) {
    console.error("stripe refresh link failed", err);
    return NextResponse.redirect(`${base}/seller/connect?error=link`);
  }
}
