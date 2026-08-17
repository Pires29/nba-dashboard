"use client";

import Link from "next/link";

export function PageSkeleton({ label = "Loading page" }) {
  return (
    <div aria-label={label} className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.05]" />
      <div className="h-11 w-full animate-pulse rounded-xl bg-white/[0.04]" />
      <div className="min-h-[420px] flex-1 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.03]" />
      <span className="sr-only" aria-live="polite">{label}</span>
    </div>
  );
}

export function StatePanel({ title, description, actionLabel, onAction, href }) {
  const actionClass = "rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-300";
  return (
    <section className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center px-5 text-center">
      <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0D1828] p-7">
        <h1 className="text-xl font-black text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        {onAction && <button type="button" onClick={onAction} className={`mt-6 ${actionClass}`}>{actionLabel}</button>}
        {href && <Link href={href} className={`mt-6 inline-block ${actionClass}`}>{actionLabel}</Link>}
      </div>
    </section>
  );
}
