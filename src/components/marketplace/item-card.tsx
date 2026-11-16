import { MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/listing-utils";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/listing";
import { BuyNowButton } from "./buy-now-button";
import { ListingImage } from "./listing-image";
import { TimeAgo } from "./time-ago";

export function ItemCard({ listing }: { listing: Listing }) {
	const sold = listing.status === "sold";

	return (
		// The title link stretches over the whole card, so the card stays one big
		// click target while Buy Now remains a separate, valid button above it.
		<div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
			<div className="relative">
				<ListingImage
					src={listing.image_url}
					alt=""
					className={cn("aspect-[4/3] w-full", sold && "opacity-60")}
				/>
				{sold && (
					<span className="absolute top-2 left-2 rounded-md bg-foreground px-2 py-1 text-xs font-semibold text-background">
						Sold
					</span>
				)}
			</div>
			<div className="flex flex-1 flex-col gap-1 p-3">
				<p className="text-lg leading-tight font-semibold tracking-tight">
					{formatPrice(listing.price)}
				</p>
				<h3 className="line-clamp-2 text-sm leading-snug text-foreground/90 group-hover:text-primary">
					<Link
						href={`/item/${listing.id}`}
						className="after:absolute after:inset-0 focus-visible:outline-none"
					>
						{listing.title}
					</Link>
				</h3>
				<p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
					<MapPin className="size-3 shrink-0" aria-hidden />
					<span className="truncate">{listing.location}</span>
				</p>
				<div className="mt-auto flex items-center justify-between gap-2 pt-2">
					<TimeAgo
						iso={listing.created_at}
						className="text-xs text-muted-foreground"
					/>
					<Badge variant="secondary" className="shrink-0">
						{listing.category}
					</Badge>
				</div>
				{listing.can_buy && (
					<div className="relative z-10 pt-2">
						<BuyNowButton listingId={listing.id} className="h-9" />
					</div>
				)}
			</div>
		</div>
	);
}
