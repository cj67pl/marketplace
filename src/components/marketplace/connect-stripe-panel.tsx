"use client";

import { AlertCircle, CheckCircle2, CircleDashed, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_PATTERN } from "@/lib/listing-utils";
import { cn } from "@/lib/utils";
import type { ConnectStatus } from "@/types/seller";

interface Props {
  /** Status already resolved on the server after returning from Stripe. */
  initialStatus?: ConnectStatus;
  /** Seller account id, used to resume onboarding after returning from Stripe. */
  initialSid?: string;
  initialError?: string;
}

const COPY: Record<ConnectStatus, { label: string; text: string }> = {
  not_connected: {
    label: "Not connected",
    text: "No Stripe account is connected to this email yet.",
  },
  incomplete: {
    label: "Onboarding incomplete",
    text: "Your Stripe account exists, but onboarding isn’t finished. Buyers can’t purchase your listings until it is.",
  },
  connected: {
    label: "Connected",
    text: "You’re all set. Buy Now now appears on every listing posted with this email.",
  },
};

export function ConnectStripePanel({ initialStatus, initialSid, initialError }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ConnectStatus | null>(initialStatus ?? null);
  const [busy, setBusy] = useState<"connect" | "status" | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [emailError, setEmailError] = useState<string | null>(null);

  function checkEmail(): string | null {
    const value = email.trim();
    if (!value) return "Enter the email you used on your listings.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address, like name@example.com.";
    return null;
  }

  async function call(path: string, kind: "connect" | "status") {
    const problem = checkEmail();
    setEmailError(problem);
    if (problem) return;

    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.url) {
        window.location.assign(data.url); // hosted Stripe onboarding
        return;
      }
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  const copy = status ? COPY[status] : null;

  return (
    <div className="space-y-5">
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {copy && status && (
        <div
          role="status"
          className={cn(
            "flex gap-3 rounded-xl border p-4",
            status === "connected" && "border-emerald-200 bg-emerald-50 text-emerald-900",
            status === "incomplete" && "border-amber-200 bg-amber-50 text-amber-900",
            status === "not_connected" && "bg-card",
          )}
        >
          {status === "connected" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
          ) : (
            <CircleDashed className="mt-0.5 size-5 shrink-0" aria-hidden />
          )}
          <div className="space-y-2 text-sm">
            <Badge variant="secondary">{copy.label}</Badge>
            <p>{copy.text}</p>
            {status === "incomplete" && initialSid && (
              <a
                href={`/api/stripe/connect/refresh?sid=${initialSid}`}
                className={cn(buttonVariants(), "h-10 px-4")}
              >
                Continue onboarding
              </a>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <div className="space-y-1.5">
          <label htmlFor="seller-email" className="text-sm font-medium">
            Seller email <span aria-hidden className="text-destructive">*</span>
            <span className="sr-only"> (required)</span>
          </label>
          <Input
            id="seller-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            aria-required
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "seller-email-error" : "seller-email-hint"}
            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
            className="h-10 text-base md:text-sm"
          />
          {emailError ? (
            <p id="seller-email-error" className="text-sm text-destructive">{emailError}</p>
          ) : (
            <p id="seller-email-hint" className="text-xs text-muted-foreground">
              Use the email address from your marketplace listings.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="h-10 px-5"
            disabled={busy !== null}
            onClick={() => call("/api/stripe/connect", "connect")}
          >
            {busy === "connect" && <Loader2 className="animate-spin" aria-hidden />}
            {busy === "connect"
              ? "Connecting…"
              : status === "incomplete"
                ? "Continue onboarding"
                : "Connect with Stripe"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            disabled={busy !== null}
            onClick={() => call("/api/stripe/status", "status")}
          >
            {busy === "status" ? <Loader2 className="animate-spin" aria-hidden /> : <RefreshCw aria-hidden />}
            Check status
          </Button>
        </div>
      </div>
    </div>
  );
}
