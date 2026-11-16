import "server-only";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeEmail } from "@/lib/payments";
import { EMAIL_PATTERN } from "@/lib/listing-utils";
import type { ConnectStatus } from "@/types/seller";

export interface SellerAccountRow {
  id: string;
  seller_email: string;
  stripe_account_id: string;
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

const COLUMNS =
  "id, seller_email, stripe_account_id, details_submitted, charges_enabled, payouts_enabled";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

/** Returns a normalized email, or null if it isn't a valid address. */
export function parseEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = normalizeEmail(value);
  return email.length <= 255 && EMAIL_PATTERN.test(email) ? email : null;
}

/** A seller is buy-ready once Stripe says details are submitted and charges are on. */
export function deriveStatus(row: SellerAccountRow | null): ConnectStatus {
  if (!row) return "not_connected";
  return row.details_submitted && row.charges_enabled ? "connected" : "incomplete";
}

export async function findSellerAccountByEmail(email: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("seller_accounts")
    .select(COLUMNS)
    .ilike("seller_email", escapeLike(email))
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SellerAccountRow | null;
}

export async function findSellerAccountById(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("seller_accounts")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SellerAccountRow | null;
}

/** `_` and `%` are wildcards in ILIKE, so escape them to match the email exactly. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** True if at least one listing was posted with this seller email. */
export async function sellerHasListings(email: string): Promise<boolean> {
  const { count, error } = await getSupabaseAdmin()
    .from("listings")
    .select("id", { count: "exact", head: true })
    .ilike("seller_email", escapeLike(email));
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

/** Ask Stripe for the account's real state and store it. */
export async function syncSellerAccount(row: SellerAccountRow): Promise<SellerAccountRow> {
  const account = await getStripe().accounts.retrieve(row.stripe_account_id);
  const next = {
    details_submitted: !!account.details_submitted,
    charges_enabled: !!account.charges_enabled,
    payouts_enabled: !!account.payouts_enabled,
  };
  const { error } = await getSupabaseAdmin()
    .from("seller_accounts")
    .update(next)
    .eq("id", row.id);
  if (error) throw new Error(error.message);
  return { ...row, ...next };
}

/** Creates a Stripe connected account and stores it. Never replaces an existing one. */
export async function createSellerAccount(email: string): Promise<SellerAccountRow> {
  const stripe = getStripe();
  // The sandbox platform uses Stripe "Managed Risk": Stripe, not the platform,
  // covers negative balances, so the legacy `type: "express"` is rejected.
  // `controller` describes the same account without `type`. The full Stripe
  // Dashboard is the option that works with Managed Risk today (the Express
  // Dashboard needs a preview API version).
  const account = await stripe.accounts.create({
    email,
    controller: {
      losses: { payments: "stripe" },
      fees: { payer: "account" },
      stripe_dashboard: { type: "full" },
      requirement_collection: "stripe",
    },
    // Stripe requires `transfers` whenever `card_payments` is requested.
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { seller_email: email, app: "marketplace" },
  });

  const { data, error } = await getSupabaseAdmin()
    .from("seller_accounts")
    .insert({ seller_email: email, stripe_account_id: account.id })
    .select(COLUMNS)
    .single();

  if (error) {
    // Lost a race with a parallel request: discard our account, use the winner.
    await stripe.accounts.del(account.id).catch(() => undefined);
    if (error.code === "23505") {
      const existing = await findSellerAccountByEmail(email);
      if (existing) return existing;
    }
    throw new Error(error.message);
  }
  return data as SellerAccountRow;
}

export async function createOnboardingLink(row: SellerAccountRow, baseUrl: string) {
  const link = await getStripe().accountLinks.create({
    account: row.stripe_account_id,
    type: "account_onboarding",
    refresh_url: `${baseUrl}/api/stripe/connect/refresh?sid=${row.id}`,
    return_url: `${baseUrl}/seller/connect?return=${row.id}`,
  });
  return link.url;
}

export function getBaseUrl(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return configured || new URL(req.url).origin;
}
