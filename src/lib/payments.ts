/** Share of each sale the marketplace keeps, as a percentage. */
export const PLATFORM_FEE_PERCENT = 10;

export const CURRENCY = "usd";

/** Convert a decimal price (e.g. 12.5 or "12.50") to integer cents. */
export function toCents(price: number | string): number {
  return Math.round(Number(price) * 100);
}

/** Platform fee in cents for a price in cents. */
export function platformFeeCents(priceCents: number): number {
  return Math.round((priceCents * PLATFORM_FEE_PERCENT) / 100);
}

/** Emails are the seller identity, so always compare them in one normal form. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
