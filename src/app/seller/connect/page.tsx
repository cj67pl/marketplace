import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectStripePanel } from "@/components/marketplace/connect-stripe-panel";
import {
  deriveStatus,
  findSellerAccountById,
  isUuid,
  syncSellerAccount,
} from "@/lib/seller-accounts";
import type { ConnectStatus } from "@/types/seller";

export const metadata: Metadata = { title: "Get paid with Stripe · Marketplace" };

// Runs when the seller comes back from Stripe: ask Stripe for the real status.
async function ConnectContent({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; error?: string }>;
}) {
  const params = await searchParams;
  let status: ConnectStatus | undefined;
  let sid: string | undefined;
  let error: string | undefined;

  if (params.error === "link") {
    error = "Your onboarding link expired. Enter your email below to get a new one.";
  } else if (isUuid(params.return)) {
    try {
      const row = await findSellerAccountById(params.return);
      if (row) {
        status = deriveStatus(await syncSellerAccount(row));
        sid = row.id;
      }
    } catch (err) {
      console.error("connect return failed", err);
      error = "We couldn’t check your Stripe status. Use “Check status” below.";
    }
  }

  return <ConnectStripePanel initialStatus={status} initialSid={sid} initialError={error} />;
}

export default function ConnectPage(props: PageProps<"/seller/connect">) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Get paid with Stripe</h1>
        <p className="mt-1 text-muted-foreground">
          Connect your Stripe account so buyers can purchase your listings. The marketplace keeps a
          10% platform fee on each sale.
        </p>
      </div>
      <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-muted" aria-busy="true" />}>
        <ConnectContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
