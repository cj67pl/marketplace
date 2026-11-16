import { listings } from "@/data/listings";
import type { Category, Listing } from "@/types/listing";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Consistent currency format used across the whole app. */
export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return priceFormatter.format(price);
}

/** Coarse relative time. `now` is required so no clock is read during prerender. */
export function timeAgo(iso: string, now: number): string {
  const hours = Math.floor((now - new Date(iso).getTime()) / 36e5);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function filterListings(
  items: Listing[],
  opts: { category?: Category | null; query?: string } = {},
): Listing[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  return items
    .filter((l) => !opts.category || l.category === opts.category)
    .filter(
      (l) =>
        !q ||
        l.title.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q),
    )
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function getListingById(id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}

/** Same-category listings first, then other recent listings. */
export function getRelatedListings(listing: Listing, limit = 4): Listing[] {
  const others = listings.filter((l) => l.id !== listing.id);
  const same = others.filter((l) => l.category === listing.category);
  const rest = others.filter((l) => l.category !== listing.category);
  return [...same, ...rest].slice(0, limit);
}

export function initialsFromEmail(email: string): string {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
