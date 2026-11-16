"use client";

import { CATEGORY_INFO } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  /** Selected category slug. */
  value: string;
  onChange: (slug: string) => void;
}

export function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORY_INFO.map(({ slug, label }) => {
        const active = slug === value;
        return (
          <button
            key={slug}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(slug)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-foreground/80 hover:bg-muted",
            )}
          >
            {slug === "all" ? "All" : label}
          </button>
        );
      })}
    </div>
  );
}
