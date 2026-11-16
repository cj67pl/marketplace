"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ListingImage } from "./listing-image";

export function ItemGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0] ?? null;

  return (
    <div className="space-y-3">
      <ListingImage
        src={current}
        alt={title}
        priority
        className="aspect-[4/3] w-full rounded-xl border"
      />
      {images.length > 1 && (
        <ul className="flex gap-2" aria-label="Photo thumbnails">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={cn(
                  "block overflow-hidden rounded-lg border-2 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  i === active ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
                )}
              >
                <ListingImage src={src} alt="" className="size-16 sm:size-20" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
