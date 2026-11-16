"use client";

import { useSyncExternalStore } from "react";
import { timeAgo } from "@/lib/listing-utils";

const subscribe = () => () => {};

// One timestamp per page load, so the snapshot stays stable between renders.
let clientNow: number | undefined;
const getClientNow = () => (clientNow ??= Date.now());
const getServerNow = () => null;

/**
 * Relative time ("3 hours ago"). While prerendering it shows a fixed date,
 * then switches to relative time in the browser, so no clock is read on the
 * server and hydration stays consistent.
 */
export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const now = useSyncExternalStore(subscribe, getClientNow, getServerNow);

  const label =
    now === null
      ? new Date(iso).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : timeAgo(iso, now);

  return (
    <time dateTime={iso} className={className}>
      {label}
    </time>
  );
}
