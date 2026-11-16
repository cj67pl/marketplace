import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Server-side Stripe client. Never import this from a Client Component. */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  client = new Stripe(key);
  return client;
}
