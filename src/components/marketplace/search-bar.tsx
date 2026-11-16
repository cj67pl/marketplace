"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSearch } from "./search-provider";

export function SearchBar({ className }: { className?: string }) {
  const { query, setQuery } = useSearch();
  const pathname = usePathname();
  const router = useRouter();

  // Browse pages filter live as the user types; other pages jump to results.
  const isBrowsePage = pathname === "/" || pathname.startsWith("/category/");

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!isBrowsePage) router.push("/");
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Search Marketplace
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="site-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Marketplace"
        autoComplete="off"
        className="h-10 rounded-full border-transparent bg-muted pr-10 pl-10 text-base focus-visible:bg-card md:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-border hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
