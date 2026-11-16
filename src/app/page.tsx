import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ListingBrowser } from "@/components/marketplace/listing-browser";
import { ListingsSkeleton } from "@/components/marketplace/listings-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { fetchListings } from "@/lib/listings-api";
import { cn } from "@/lib/utils";

async function Listings() {
  const listings = await fetchListings();
  return <ListingBrowser listings={listings} showCategoryTabs />;
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Marketplace</h1>
          <p className="mt-1 text-muted-foreground">
            Discover great finds from sellers in your community.
          </p>
        </div>
        <Link href="/create" className={cn(buttonVariants(), "h-10 gap-1.5 px-4")}>
          <Plus aria-hidden />
          Create Listing
        </Link>
      </div>
      <Suspense fallback={<ListingsSkeleton />}>
        <Listings />
      </Suspense>
    </div>
  );
}
