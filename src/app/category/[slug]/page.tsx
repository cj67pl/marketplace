import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingBrowser } from "@/components/marketplace/listing-browser";
import { ListingsSkeleton } from "@/components/marketplace/listings-skeleton";
import { getCategoryBySlug } from "@/lib/categories";
import { fetchListings } from "@/lib/listings-api";

export const metadata: Metadata = { title: "Browse categories · Marketplace" };

// `params` is runtime data, so it is read inside <Suspense>.
async function CategoryContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = getCategoryBySlug(slug);
  if (!info) notFound();
  const listings = await fetchListings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{info.label}</h1>
        <p className="mt-1 text-muted-foreground">{info.description}</p>
      </div>
      <ListingBrowser listings={listings} category={info.category} scopeLabel={info.label} />
    </div>
  );
}

export default function CategoryPage(props: PageProps<"/category/[slug]">) {
  return (
    <Suspense fallback={<ListingsSkeleton />}>
      <CategoryContent params={props.params} />
    </Suspense>
  );
}
