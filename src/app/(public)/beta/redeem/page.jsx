"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeInternalPath } from "@/lib/security";
import { signOutWithBetaCleanup } from "@/lib/signOutWithBetaCleanup";

export default function BetaRedeemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const destination = safeInternalPath(searchParams.get("callbackUrl"), "/props");

    async function redeem() {
      try {
        const response = await fetch("/api/beta/redeem", { method: "POST" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to redeem beta access");
        if (!cancelled) router.replace(destination);
      } catch (redeemError) {
        if (!cancelled) setError(redeemError.message);
      }
    }

    redeem();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md items-center px-6 text-center">
      <div className="w-full rounded-xl border border-white/[0.08] bg-[#0b1421] p-6 text-white">
        <h1 className="text-xl font-black">
          {error ? "Beta invitation unavailable" : "Confirming beta access"}
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          {error || "We are linking your beta code to this account."}
        </p>
        {error ? (
          <button
            type="button"
            onClick={() => signOutWithBetaCleanup({ callbackUrl: "/" })}
            className="mt-5 rounded-lg bg-orange-500 px-4 py-2 font-mono text-xs font-black uppercase tracking-widest text-white transition hover:bg-orange-400"
          >
            Sign out and return home
          </button>
        ) : null}
      </div>
    </section>
  );
}
