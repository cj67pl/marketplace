"use client";

import { CreditCard, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useSearch } from "@/components/marketplace/search-provider";
import { CATEGORY_INFO, HOME_NAV } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface NavItem {
	href: string;
	label: string;
	icon: LucideIcon;
}

const BROWSE_ITEMS: NavItem[] = [
	{ href: HOME_NAV.href, label: HOME_NAV.label, icon: HOME_NAV.icon },
	...CATEGORY_INFO.map((c) => ({
		href: `/category/${c.slug}`,
		label: c.label,
		icon: c.icon,
	})),
];

// Sellers connect Stripe here once. Buyers pay from each product page instead.
const SELLER_ITEMS: NavItem[] = [
	{ href: "/seller/connect", label: "Seller payouts", icon: CreditCard },
];

function NavLink({
	item,
	onNavigate,
}: {
	item: NavItem;
	onNavigate?: () => void;
}) {
	const pathname = usePathname();
	const { setQuery } = useSearch();
	const active = pathname === item.href;
	const Icon = item.icon;

	return (
		<li>
			<Link
				href={item.href}
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
				{item.label}
			</Link>
		</li>
	);
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div>
			<ul className="space-y-1">
				{BROWSE_ITEMS.map((item) => (
					<NavLink
						key={item.href}
						item={item}
						onNavigate={onNavigate}
					/>
				))}
			</ul>
			<div className="mt-4 border-t pt-4">
				<p className="px-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					For sellers
				</p>
				<ul className="space-y-1">
					{SELLER_ITEMS.map((item) => (
						<NavLink
							key={item.href}
							item={item}
							onNavigate={onNavigate}
						/>
					))}
				</ul>
			</div>
		</div>
	);
}

function NavLinksSkeleton() {
	return (
		<ul className="space-y-1" aria-hidden>
			{[...BROWSE_ITEMS, ...SELLER_ITEMS].map(({ href }) => (
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
