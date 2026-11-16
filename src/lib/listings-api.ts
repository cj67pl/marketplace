import { connection } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/types/listing";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The three fetch* functions run on the server at request time. `connection()`
// keeps them out of the prerender: supabase-js swallows the abort Next.js uses
// to end a prerender, which otherwise surfaces as a bogus "AbortError".

export async function fetchListings(): Promise<Listing[]> {
  await connection();
  const { data, error } = await supabase
    .from("listings").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Listing[];
}

export async function fetchListing(id: string): Promise<Listing | null> {
  await connection();
  if (!UUID.test(id)) return null; // avoids a Postgres "invalid uuid" error
  const { data, error } = await supabase
    .from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Listing | null;
}

export async function fetchRelated(listing: Listing, limit = 4): Promise<Listing[]> {
  await connection();
  const { data, error } = await supabase
    .from("listings").select("*").neq("id", listing.id)
    .order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return data as Listing[];
}
