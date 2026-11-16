import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initialsFromEmail } from "@/lib/listing-utils";

export function SellerCard({ email }: { email: string }) {
  return (
    <section aria-labelledby="seller-heading" className="rounded-xl border bg-card p-4">
      <h2 id="seller-heading" className="sr-only">
        Seller information
      </h2>
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {initialsFromEmail(email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Seller
          </p>
          <p className="truncate text-sm font-medium">{email}</p>
        </div>
      </div>
    </section>
  );
}
