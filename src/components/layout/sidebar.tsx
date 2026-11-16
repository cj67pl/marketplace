"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Suspense } from "react";
import { useSearch } from "@/components/marketplace/search-provider";
import { CATEGORY_INFO, HOME_NAV } from "@/lib/categories";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ href: HOME_NAV.href, label: HOME_NAV.label, icon: HOME_NAV.icon },
	...CATEGORY_INFO.map((c) => ({
		href: `/category/${c.slug}`,
		label: c.label,
		icon: c.icon,
	})),
	{
		href: "/seller/connect",
		label: "Get paid with Stripe",
		icon: CreditCard,
	},
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname();
	const { setQuery } = useSearch();

	return (
		<ul className="space-y-1">
			{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
				const active = pathname === href;
				return (
					<li key={href}>
						<Link
							href={href}
							aria-current={active ? "page" : undefined}
							onClick={() => {
								setQuery("");
								onNavigate?.();
							}}
							className={cn(
								"flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
								active
									? "bg-primary/10 font-semibold text-primary"
									: "font-medium text-foreground/80 hover:bg-muted",
							)}
						>
							<span
								className={cn(
									"grid size-8 place-items-center rounded-full",
									active
										? "bg-primary text-primary-foreground"
										: "bg-muted",
								)}
							>
								<Icon className="size-4" aria-hidden />
							</span>
							{label}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}

function NavLinksSkeleton() {
	return (
		<ul className="space-y-1" aria-hidden>
			{NAV_ITEMS.map(({ href }) => (
				<li
					key={href}
					className="h-11 animate-pulse rounded-lg bg-muted/60"
				/>
			))}
		</ul>
	);
}

export function Sidebar() {
	return (
		<aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-r bg-card p-3 lg:block">
			<nav aria-label="Marketplace categories">
				<Suspense fallback={<NavLinksSkeleton />}>
					<NavLinks />
				</Suspense>
			</nav>
		</aside>
	);
}
