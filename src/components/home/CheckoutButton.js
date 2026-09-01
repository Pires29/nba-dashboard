"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { captureEvent } from "@/components/PostHogProvider";

const buttonLabel = (billing, loading, trialUnavailable, monthlyAlreadyScheduled) => {
  if (loading) return "Redirecting...";
  if (trialUnavailable) return "Trial active";
  if (monthlyAlreadyScheduled) return "Renews automatically";
  if (billing === "trial") return "Start Free Trial";
  if (billing === "monthly") return "Choose Monthly";
  return "Get Season Pass";
};

export default function CheckoutButton({
  billing,
  disabled = false,
  trialUnavailable = false,
  monthlyAlreadyScheduled = false,
  featured = false,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleReferral = (event) => {
      setReferralCode(event.detail?.code ?? null);
    };

    window.addEventListener("home-referral-applied", handleReferral);
    return () => window.removeEventListener("home-referral-applied", handleReferral);
  }, []);

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing, referralCode }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.push("/login?callbackUrl=%2F%23pricing");
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.error || "Unable to start checkout");
      captureEvent("checkout_started", {
        billing,
        has_referral: Boolean(referralCode),
      });
      window.location.href = data.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={startCheckout}
        disabled={loading || disabled}
        className={`w-full rounded-xl py-3.5 font-mono text-[10px] font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-45 ${featured ? "bg-orange-500 text-white shadow-[0_0_25px_rgba(249,115,22,.25)] hover:bg-orange-400" : "border border-white/15 bg-white/[0.03] text-slate-200 hover:border-orange-500/40 hover:text-orange-300"}`}
      >
        {buttonLabel(billing, loading, trialUnavailable, monthlyAlreadyScheduled)}
      </button>
      {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center font-mono text-[10px] text-red-300">{error}</p>}
    </>
  );
}
