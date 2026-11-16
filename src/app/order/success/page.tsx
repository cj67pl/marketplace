import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/marketplace/auto-refresh";
import { EmptyState } from "@/components/marketplace/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/listing-utils";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order confirmation · Marketplace" };

type View = "paid" | "processing" | "failed";

async function OrderContent({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const sessionId = typeof session_id === "string" && /^cs_[A-Za-z0-9_]+$/.test(session_id) ? session_id : null;

  const homeLink = (
    <Link href="/" className={cn(buttonVariants(), "h-10 px-4")}>
      Back to Marketplace
    </Link>
  );

  const db = getSupabaseAdmin();
  const { data: order } = sessionId
    ? await db
        .from("orders")
        .select("id, listing_id, status, buyer_email, price_cents, stripe_account_id, listings(title, image_url)")
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle()
    : { data: null };

  if (!sessionId || !order) {
    return (
      <EmptyState title="We couldn’t find that order" description="The link may be incorrect or incomplete.">
        {homeLink}
      </EmptyState>
    );
  }

  // Ask Stripe what actually happened. The database order is only updated by the
  // verified webhook; this page never marks anything as paid or sold.
  let view: View = "processing";
  let buyerEmail = order.buyer_email as string | null;
  if (order.status === "paid") {
    view = "paid";
  } else {
    try {
      const session = await getStripe().checkout.sessions.retrieve(
        sessionId,
        {},
        { stripeAccount: order.stripe_account_id },
      );
      buyerEmail = buyerEmail ?? session.customer_details?.email ?? null;
      if (session.status === "expired" || order.status === "expired" || order.status === "failed") view = "failed";
      else view = "processing"; // paid on Stripe's side but not yet confirmed by the webhook
    } catch (err) {
      console.error("order success: stripe lookup failed", err);
    }
  }

  const listing = (Array.isArray(order.listings) ? order.listings[0] : order.listings) as
    | { title: string; image_url: string | null }
    | null;

  const copy = {
    paid: {
      icon: <CheckCircle2 className="size-7" aria-hidden />,
      tone: "bg-emerald-100 text-emerald-700",
      title: "Thank you, your order is confirmed",
      text: "Your payment went through and the item is now marked as sold.",
    },
    processing: {
      icon: <Clock className="size-7" aria-hidden />,
      tone: "bg-amber-100 text-amber-700",
      title: "We’re confirming your payment",
      text: "This usually takes a few seconds. Your order isn’t confirmed until Stripe tells us the payment succeeded.",
    },
    failed: {
      icon: <XCircle className="size-7" aria-hidden />,
      tone: "bg-red-100 text-red-700",
      title: "Your payment wasn’t completed",
      text: "You haven’t been charged. You can go back to the listing and try again.",
    },
  }[view];

  return (
    <div role="status" className="flex flex-col items-center rounded-xl border bg-card px-6 py-12 text-center">
      <div className={cn("grid size-14 place-items-center rounded-full", copy.tone)}>{copy.icon}</div>
      <h1 className="mt-4 text-xl font-semibold">{copy.title}</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{copy.text}</p>

      <dl className="mt-6 w-full max-w-sm divide-y rounded-lg border text-left text-sm">
        <div className="flex justify-between gap-4 px-4 py-2.5">
          <dt className="text-muted-foreground">Item</dt>
          <dd className="font-medium">{listing?.title ?? "Listing"}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-2.5">
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="font-medium">{formatPrice(order.price_cents / 100)}</dd>
        </div>
        {buyerEmail && (
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted-foreground">Receipt sent to</dt>
            <dd className="font-medium break-all">{buyerEmail}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 px-4 py-2.5">
          <dt className="text-muted-foreground">Order</dt>
          <dd className="font-mono text-xs">{order.id.slice(0, 8)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {view === "failed" ? (
          <Link href={`/item/${order.listing_id}`} className={cn(buttonVariants(), "h-10 px-4")}>
            Back to the listing
          </Link>
        ) : (
          homeLink
        )}
      </div>
      {view === "processing" && (
        <div className="mt-4">
          <AutoRefresh />
        </div>
      )}
    </div>
  );
}

export default function OrderSuccessPage(props: PageProps<"/order/success">) {
  return (
    <div className="mx-auto max-w-xl">
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted" aria-busy="true" />}>
        <OrderContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
