import {
  Armchair,
  Car,
  Flower2,
  Home,
  LayoutGrid,
  MoreHorizontal,
  Shirt,
  Smartphone,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types/listing";

export interface CategoryInfo {
  slug: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** `null` means "all categories". */
  category: Category | null;
}

export const CATEGORY_INFO: CategoryInfo[] = [
  {
    slug: "all",
    label: "All Categories",
    icon: LayoutGrid,
    description: "Everything for sale in your community, from newest to oldest.",
    category: null,
  },
  {
    slug: "electronics",
    label: "Electronics",
    icon: Smartphone,
    description: "Phones, laptops, audio gear, cameras and more.",
    category: "Electronics",
  },
  {
    slug: "furniture",
    label: "Furniture",
    icon: Armchair,
    description: "Sofas, desks, tables and storage for every room.",
    category: "Furniture",
  },
  {
    slug: "clothing",
    label: "Clothing",
    icon: Shirt,
    description: "Secondhand fashion, outerwear and accessories.",
    category: "Clothing",
  },
  {
    slug: "home-garden",
    label: "Home & Garden",
    icon: Flower2,
    description: "Planters, tools, decor and everything for your outdoor space.",
    category: "Home & Garden",
  },
  {
    slug: "sports-outdoors",
    label: "Sports & Outdoors",
    icon: Trophy,
    description: "Bikes, fitness equipment and gear for your next adventure.",
    category: "Sports & Outdoors",
  },
  {
    slug: "vehicles",
    label: "Vehicles",
    icon: Car,
    description: "Cars, scooters and motorcycles from local sellers.",
    category: "Vehicles",
  },
  {
    slug: "other",
    label: "Other",
    icon: MoreHorizontal,
    description: "Instruments, collectibles and one-of-a-kind finds.",
    category: "Other",
  },
];

export const HOME_NAV = { href: "/", label: "Home", icon: Home } as const;

export function getCategoryBySlug(slug: string) {
  return CATEGORY_INFO.find((c) => c.slug === slug);
}

export function getCategoryInfo(category: Category) {
  return CATEGORY_INFO.find((c) => c.category === category);
}
