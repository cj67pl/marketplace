import type { Listing } from "@/types/listing";
import { ItemCard } from "./item-card";

export function ItemGrid({ listings }: { listings: Listing[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <li key={listing.id} className="min-w-0">
          <ItemCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}
