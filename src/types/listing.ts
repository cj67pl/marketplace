export const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Vehicles",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ListingStatus = "available" | "sold";

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  /** Price in whole or fractional US dollars. */
  price: number;
  category: Category;
  seller_email: string;
  image_url: string | null;
  location: string;
  /** ISO 8601 timestamp. */
  created_at: string;
  /** Missing on rows from before the Stripe migration; treat as "available". */
  status?: ListingStatus;
  /** Computed on the server: seller is connected to Stripe and the item is unsold. */
  can_buy?: boolean;
  /** Optional extra photos shown as thumbnails on the detail page. */
  images?: string[];
}
