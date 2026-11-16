import { SearchX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/marketplace/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="We couldn’t find that page"
      description="The listing or category may have been removed, or the link might be incorrect."
    >
      <Link href="/" className={cn(buttonVariants(), "h-10 px-4")}>
        Back to Marketplace
      </Link>
    </EmptyState>
  );
}
