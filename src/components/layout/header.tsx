"use client";

import { Menu, Plus, Store, X } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { SearchBar } from "@/components/marketplace/search-bar";
import { useSearch } from "@/components/marketplace/search-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLinks } from "./sidebar";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setQuery } = useSearch();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-auto max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6 md:h-16 md:flex-nowrap md:gap-4 md:py-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link
          href="/"
          onClick={() => setQuery("")}
          className="flex items-center gap-2 rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:w-[14.5rem]"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Store className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">Marketplace</span>
        </Link>

        <div className="order-last w-full md:order-none md:max-w-xl md:flex-1">
          <Suspense fallback={<div className="h-10 rounded-full bg-muted" aria-hidden />}>
            <SearchBar />
          </Suspense>
        </div>

        <Link
          href="/create"
          className={cn(buttonVariants(), "ml-auto h-10 gap-1.5 px-3 sm:px-4 md:ml-auto")}
        >
          <Plus aria-hidden />
          <span className="hidden sm:inline">Create New Listing</span>
          <span className="sr-only sm:hidden">Create New Listing</span>
        </Link>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Marketplace categories"
          className="max-h-[70dvh] overflow-y-auto border-t bg-card p-3 shadow-md lg:hidden"
        >
          <Suspense fallback={null}>
            <NavLinks onNavigate={() => setMenuOpen(false)} />
          </Suspense>
        </nav>
      )}
    </header>
  );
}
