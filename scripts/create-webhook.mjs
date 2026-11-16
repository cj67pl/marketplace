// Registers the webhook endpoint with Stripe ONCE for your production URL.
// Usage: node --env-file=.env.local scripts/create-webhook.mjs https://YOUR-APP.vercel.app
import Stripe from "stripe";

const base = process.argv[2]?.replace(/\/$/, "");
if (!base || !base.startsWith("https://")) {
  console.error("Pass your public production URL, e.g. https://your-app.vercel.app");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpoint = await stripe.webhookEndpoints.create({
  url: `${base}/api/stripe/webhook`,
  connect: true, // payments happen on connected accounts, so events come from them
  enabled_events: ["checkout.session.completed", "checkout.session.expired", "account.updated"],
});

console.log("Endpoint id:", endpoint.id);
console.log("Signing secret (shown once):", endpoint.secret);
