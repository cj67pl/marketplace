import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/listing";

// Browser-side writes (called from the Create and Message forms).
const BUCKET = "listing-images";

export async function uploadListingImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function createListing(input: {
  title: string; description: string; price: number;
  category: Category; seller_email: string; image_url: string | null;
}): Promise<string> {
  const { data, error } = await supabase.from("listings").insert(input).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function sendMessage(input: {
  listing_id: string; buyer_email: string; seller_email: string; message: string;
}) {
  const { error } = await supabase.from("messages").insert(input);
  if (error) throw new Error(error.message);
}
