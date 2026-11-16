"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ListingImageProps {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}

/** Image with a neutral placeholder if the photo fails to load. */
export function ListingImage({ src, alt, className, priority }: ListingImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <ImageOff className="size-8" aria-hidden />
          <span className="sr-only">{alt} (image unavailable)</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailedSrc(src)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}
