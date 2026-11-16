import { connection } from "next/server";
import "server-only";
import { normalizeEmail } from "@/lib/payments";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Listing } from "@/types/listing";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Emails of sellers whose Stripe account is ready to take payments. */
async function connectedSellerEmails(): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdmin()
    .from("seller_accounts")
    .select("seller_email")
    .eq("details_submitted", true)
    .eq("charges_enabled", true);
  if (error) {
    // Keep browsing working even if payments aren't set up yet.
    console.error("connected sellers lookup failed", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => normalizeEmail(r.seller_email)));
}

/** Adds `can_buy`: unsold and the seller is connected. Only a boolean reaches the browser. */
async function withBuyability(listings: Listing[]): Promise<Listing[]> {
  const connected = await connectedSellerEmails();
  return listings.map((l) => ({
    ...l,
    can_buy: l.status !== "sold" && connected.has(normalizeEmail(l.seller_email)),
  }));
}

// The three fetch* functions run on the server at request time. `connection()`
// keeps them out of the prerender: supabase-js swallows the abort Next.js uses
// to end a prerender, which otherwise surfaces as a bogus "AbortError".

export async function fetchListings(): Promise<Listing[]> {
  await connection();
  const { data, error } = await supabase
    .from("listings").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return withBuyability(data as Listing[]);
}

export async function fetchListing(id: string): Promise<Listing | null> {
  await connection();
  if (!UUID.test(id)) return null; // avoids a Postgres "invalid uuid" error
  const { data, error } = await supabase
    .from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return (await withBuyability([data as Listing]))[0];
}

export async function fetchRelated(listing: Listing, limit = 4): Promise<Listing[]> {
  await connection();
  const { data, error } = await supabase
    .from("listings").select("*").neq("id", listing.id)
    .order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return withBuyability(data as Listing[]);
}
