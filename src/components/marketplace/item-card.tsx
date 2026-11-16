import { MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/listing-utils";
import type { Listing } from "@/types/listing";
import { ListingImage } from "./listing-image";
import { TimeAgo } from "./time-ago";

export function ItemCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/item/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ListingImage
        src={listing.image_url}
        alt={listing.title}
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-lg leading-tight font-semibold tracking-tight">
          {formatPrice(listing.price)}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug text-foreground/90 group-hover:text-primary">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{listing.location}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <TimeAgo iso={listing.created_at} className="text-xs text-muted-foreground" />
          <Badge variant="secondary" className="shrink-0">
            {listing.category}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
