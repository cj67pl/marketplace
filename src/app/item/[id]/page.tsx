import { ArrowLeft, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItemGallery } from "@/components/marketplace/item-gallery";
import { ItemGrid } from "@/components/marketplace/item-grid";
import { MessageSellerForm } from "@/components/marketplace/message-seller-form";
import { SellerCard } from "@/components/marketplace/seller-card";
import { TimeAgo } from "@/components/marketplace/time-ago";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/listing-utils";
import { fetchListing, fetchRelated } from "@/lib/listings-api";

const backLink = (
	<Link
		href="/"
		className="inline-flex h-10 items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
	>
		<ArrowLeft className="size-4" aria-hidden />
		Back to Marketplace
	</Link>
);

async function ItemContent({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const listing = await fetchListing(id);
	if (!listing) notFound();
	const related = await fetchRelated(listing);

	return (
		<div className="space-y-10">
			<div className="space-y-5">
				{backLink}
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
					<ItemGallery
						images={listing.image_url ? [listing.image_url] : []}
						title={listing.title}
					/>
					<div className="space-y-5">
						<div className="space-y-3">
							<Badge variant="secondary">
								{listing.category}
							</Badge>
							<h1 className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
								{listing.title}
							</h1>
							<p className="text-2xl font-semibold">
								{formatPrice(Number(listing.price))}
							</p>
							<div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
								<span className="inline-flex items-center gap-1.5">
									<MapPin className="size-4" aria-hidden />
									{listing.location}
								</span>
								<span className="inline-flex items-center gap-1.5">
									<Clock className="size-4" aria-hidden />
									Listed <TimeAgo iso={listing.created_at} />
								</span>
							</div>
						</div>
						<Separator />
						<section aria-labelledby="description-heading">
							<h2
								id="description-heading"
								className="text-lg font-semibold"
							>
								Description
							</h2>
							<p className="mt-2 leading-relaxed whitespace-pre-line text-foreground/80">
								{listing.description ||
									"The seller didn’t add a description."}
							</p>
						</section>
						<SellerCard email={listing.seller_email} />
						<MessageSellerForm
							listingId={listing.id}
							title={listing.title}
							sellerEmail={listing.seller_email}
						/>
					</div>
				</div>
			</div>
			<section aria-labelledby="related-heading" className="space-y-4">
				<h2
					id="related-heading"
					className="text-xl font-semibold tracking-tight"
				>
					Related listings
				</h2>
				<ItemGrid listings={related} />
			</section>
		</div>
	);
}

function ItemSkeleton() {
	return (
		<div aria-busy="true" className="space-y-5">
			{backLink}
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
				<div className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
				<div className="space-y-3">
					<div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
					<div className="h-8 w-1/4 animate-pulse rounded bg-muted" />
					<div className="h-32 animate-pulse rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}

export default function ItemPage(props: PageProps<"/item/[id]">) {
	return (
		<Suspense fallback={<ItemSkeleton />}>
			<ItemContent params={props.params} />
		</Suspense>
	);
}
