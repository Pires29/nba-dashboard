"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";

const DISMISSAL_STORAGE_KEY = "propinsight:beta-season-banner-dismissed:v1";

const subscribeToDismissal = (callback) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getDismissalSnapshot = () =>
  window.localStorage.getItem(DISMISSAL_STORAGE_KEY) === "true";

const getServerDismissalSnapshot = () => false;

const formatSnapshotDate = (updatedAt) => {
  if (!updatedAt) return null;

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const BetaSeasonDataBanner = ({ updatedAt, onVisibilityChange }) => {
  const [isDismissedLocally, setIsDismissedLocally] = useState(false);
  const isDismissedPersistently = useSyncExternalStore(
    subscribeToDismissal,
    getDismissalSnapshot,
    getServerDismissalSnapshot,
  );
  const snapshotDate = formatSnapshotDate(updatedAt);
  const isVisible = !isDismissedLocally && !isDismissedPersistently;

  useLayoutEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  const dismissBanner = () => {
    window.localStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
    setIsDismissedLocally(true);
  };

  if (!isVisible) return null;

  return (
    <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.055] px-3 py-2.5 shadow-sm shadow-black/10 sm:px-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-300">
            Beta · Previous season data
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-amber-300/40 sm:block" />
          <p className="text-[11px] leading-5 text-slate-300 sm:text-xs">
            You&apos;re exploring the 2025–26 NBA season. These stats are historical
            {snapshotDate ? ` as of ${snapshotDate}` : ""} and do not reflect current matchups.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Dismiss beta data notice"
          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-amber-200/60 transition-colors hover:bg-amber-300/10 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
        >
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BetaSeasonDataBanner;
