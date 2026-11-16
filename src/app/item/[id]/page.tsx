import {
	ArrowLeft,
	CheckCircle2,
	Clock,
	Lock,
	MapPin,
	Store,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuyNowButton } from "@/components/marketplace/buy-now-button";
import { ItemGallery } from "@/components/marketplace/item-gallery";
import { ItemGrid } from "@/components/marketplace/item-grid";
import { MessageSellerForm } from "@/components/marketplace/message-seller-form";
import { SellerCard } from "@/components/marketplace/seller-card";
import { TimeAgo } from "@/components/marketplace/time-ago";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/listing-utils";
import { fetchListing, fetchRelated } from "@/lib/listings-api";
import type { Listing } from "@/types/listing";

const backLink = (
	<Link
		href="/"
		className="inline-flex h-10 items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
	>
		<ArrowLeft className="size-4" aria-hidden />
		Back to Marketplace
	</Link>
);

/** What the buyer sees under the price: Buy Now, Sold, or why they can't pay online. */
function PurchasePanel({ listing }: { listing: Listing }) {
	if (listing.status === "sold") {
		return (
			<div
				role="status"
				className="flex gap-3 rounded-xl border bg-muted p-4 text-sm"
			>
				<CheckCircle2
					className="mt-0.5 size-5 shrink-0 text-muted-foreground"
					aria-hidden
				/>
				<div>
					<p className="font-semibold">This item has been sold</p>
					<p className="mt-0.5 text-muted-foreground">
						Browse similar listings below.
					</p>
				</div>
			</div>
		);
	}

	if (listing.can_buy) {
		return (
			<div className="space-y-2">
				<BuyNowButton
					listingId={listing.id}
					className="h-12 text-base"
				/>
				<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Lock className="size-3.5" aria-hidden /> Secure checkout
					with Stripe
				</p>
			</div>
		);
	}

	return (
		<div className="flex gap-3 rounded-xl border bg-card p-4 text-sm">
			<Store
				className="mt-0.5 size-5 shrink-0 text-muted-foreground"
				aria-hidden
			/>
			<div>
				<p className="font-semibold">
					Online payment isn’t available yet
				</p>
				<p className="mt-0.5 text-muted-foreground">
					This seller hasn’t connected Stripe. You can still send them
					a message below.
				</p>
				<p className="mt-2 text-xs text-muted-foreground">
					Are you the seller?{" "}
					<Link
						href="/seller/connect"
						className="font-medium text-primary underline-offset-2 hover:underline"
					>
						Connect Stripe
					</Link>
				</p>
			</div>
		</div>
	);
}

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
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="secondary">
									{listing.category}
								</Badge>
								{listing.status === "sold" && (
									<Badge>Sold</Badge>
								)}
							</div>
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

						<PurchasePanel listing={listing} />
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
