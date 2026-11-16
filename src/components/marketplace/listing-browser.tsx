"use client";

import { PackageSearch, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug } from "@/lib/categories";
import { filterListings } from "@/lib/listing-utils";
import type { Category, Listing } from "@/types/listing";
import { CategoryTabs } from "./category-tabs";
import { EmptyState } from "./empty-state";
import { ItemGrid } from "./item-grid";
import { useSearch } from "./search-provider";

interface ListingBrowserProps {
  listings: Listing[];
  /** Shows the category tabs (homepage). Otherwise `category` locks the scope. */
  showCategoryTabs?: boolean;
  category?: Category | null;
  scopeLabel?: string;
}

export function ListingBrowser({
  listings,
  showCategoryTabs = false,
  category = null,
  scopeLabel,
}: ListingBrowserProps) {
  const { query, setQuery } = useSearch();
  const [tab, setTab] = useState("all");

  const activeCategory = showCategoryTabs
    ? (getCategoryBySlug(tab)?.category ?? null)
    : category;

  const results = filterListings(listings, { category: activeCategory, query });
  const searching = query.trim().length > 0;

  return (
    <div className="space-y-5">
      {showCategoryTabs && <CategoryTabs value={tab} onChange={setTab} />}

      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2" aria-live="polite">
        <p className="text-sm text-muted-foreground">
          {searching ? (
            <>
              {results.length} {results.length === 1 ? "result" : "results"} for{" "}
              <span className="font-medium text-foreground">“{query.trim()}”</span>
              {scopeLabel ? ` in ${scopeLabel}` : ""}
            </>
          ) : (
            `${results.length} ${results.length === 1 ? "listing" : "listings"}`
          )}
        </p>
        {searching && (
          <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setQuery("")}>
            <X aria-hidden />
            Clear search
          </Button>
        )}
      </div>

      {results.length > 0 ? (
        <ItemGrid listings={results} />
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No listings found"
          description={
            searching
              ? "Nothing matches your search. Check the spelling or try a more general keyword."
              : "There are no listings in this category yet. Check back soon."
          }
        >
          {searching && (
            <Button variant="outline" className="h-10 px-4" onClick={() => setQuery("")}>
              Clear search
            </Button>
          )}
          {showCategoryTabs && tab !== "all" && (
            <Button variant="outline" className="h-10 px-4" onClick={() => setTab("all")}>
              Show all categories
            </Button>
          )}
        </EmptyState>
      )}
    </div>
  );
}
