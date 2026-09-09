"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import "./globals.css";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060E1A] font-sans text-white">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
              Error
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              An unexpected error occurred. Try again in a moment.
            </p>
            <button
              className="mt-7 rounded-xl bg-orange-500 px-6 py-3 font-mono text-xs font-black uppercase tracking-widest text-white transition hover:bg-orange-400"
              onClick={reset}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
