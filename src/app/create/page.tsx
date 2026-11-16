import type { Metadata } from "next";
import { CreateListingForm } from "@/components/marketplace/create-listing-form";

export const metadata: Metadata = { title: "Create a new listing · Marketplace" };

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create a new listing</h1>
        <p className="mt-1 text-muted-foreground">Add the details of the item you want to sell.</p>
        <p className="mt-3 text-xs text-muted-foreground">
          <span aria-hidden className="text-destructive">*</span> Required field
        </p>
      </div>
      <CreateListingForm />
    </div>
  );
}
