"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { captureEvent } from "@/components/PostHogProvider";
import { PAID_PLAN_PRICES, PRICING_PLANS, REFERRAL_DISCOUNT } from "@/lib/pricingPlans";

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-orange-400">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getDisplayPrice(plan, hasPromo) {
  if (!hasPromo || !Object.hasOwn(PAID_PLAN_PRICES, plan.id)) {
    return plan.price;
  }

  return plan.price * (1 - REFERRAL_DISCOUNT);
}

export default function UpgradeModalProvider() {
  const router = useRouter();
  const plans = useMemo(() => PRICING_PLANS, []);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState("trial");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoStatus, setPromoStatus] = useState(null);
  const [error, setError] = useState("");

  const selectedPlan = plans.find((plan) => plan.id === selectedBilling) ?? plans[0];

  const closeModal = () => {
    setIsOpen(false);
    setError("");
  };

  useEffect(() => {
    const openModal = (event) => {
      event.preventDefault();
      setError("");
      setIsOpen(true);
    };

    window.addEventListener("upgrade-modal:open", openModal);
    return () => window.removeEventListener("upgrade-modal:open", openModal);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  async function applyPromoCode() {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    setPromoStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/referral/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/login?callbackUrl=%2Fprops");
        return;
      }

      if (!response.ok || !data.valid) {
        setAppliedPromoCode(null);
        setPromoStatus("invalid");
        return;
      }

      setAppliedPromoCode(code);
      setPromoStatus("valid");
      captureEvent("referral_applied", { code, source: "upgrade_modal" });
    } catch {
      setAppliedPromoCode(null);
      setPromoStatus("error");
    }
  }

  async function startCheckout() {
    if (!selectedPlan) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: selectedPlan.id,
          referralCode: appliedPromoCode,
          returnPath: "/props",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/login?callbackUrl=%2Fprops");
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout");
      }

      captureEvent("checkout_started", {
        billing: selectedPlan.id,
        source: "upgrade_modal",
        has_referral: Boolean(appliedPromoCode),
      });
      window.location.href = data.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020814]/50 px-3 py-4 backdrop-blur-[2px] sm:px-4 sm:py-6"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full max-w-[440px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D1828]/88 text-white shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-md"
        style={{ maxHeight: "calc(100dvh - 2rem)" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#122040]/70 to-[#0D1828]/45" />
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25" />

        <div className="relative z-20 flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#122040]/70 px-5 py-4 backdrop-blur-md sm:px-7">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,.4)]">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6.5 15.5v2.2M11.2 12.5v5.2M15.9 9.2v8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M6.2 12.6 9.8 9.4l3 2.3 5-5.2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="upgrade-modal-title" className="hidden font-mono text-sm font-black uppercase tracking-widest min-[360px]:block">
              PROPINSIGHT
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close upgrade modal"
            onClick={(event) => {
              event.stopPropagation();
              closeModal();
            }}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-[#122040]/80 text-lg leading-none text-slate-400 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400">
            Upgrade plan
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Unlock the full props table without changing your workflow.
          </p>

          <div className="mt-7 space-y-3">
            {plans.map((plan) => {
              const selected = selectedBilling === plan.id;
              const hasPromo = Boolean(appliedPromoCode);
              const displayPrice = getDisplayPrice(plan, hasPromo);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedBilling(plan.id)}
                  className={`relative flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition ${selected ? "border-orange-500/60 bg-orange-500/[0.09] shadow-[0_0_0_1px_rgba(249,115,22,.25)]" : "border-white/[0.08] bg-[#091524]/80 hover:border-white/15 hover:bg-[#0B192B]"}`}
                >
                  {plan.featured && (
                    <span className="absolute -top-2 right-4 rounded-md bg-orange-500 px-3 py-1 font-mono text-[8px] font-black uppercase tracking-widest text-white shadow-[0_0_18px_rgba(249,115,22,.28)]">
                      Best value
                    </span>
                  )}
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${selected ? "border-orange-400" : "border-slate-600"}`}>
                    {selected && <span className="h-2 w-2 rounded-full bg-orange-400" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-white">{plan.name}</span>
                    <span className="mt-1 block font-mono text-[10px] text-slate-500">{plan.note}</span>
                  </span>
                  <span className="text-right">
                    {hasPromo && Object.hasOwn(PAID_PLAN_PRICES, plan.id) && (
                      <span className="block font-mono text-[10px] text-slate-500 line-through">
                        €{plan.price.toFixed(2)}
                      </span>
                    )}
                    <span className="block font-mono text-sm font-black text-white">
                      {displayPrice === 0 ? "Free" : `€${displayPrice.toFixed(2)}`}
                    </span>
                    <span className="block font-mono text-[10px] text-slate-500">/{plan.suffix}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-6 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
            Billing details
          </p>
          <ul className="mt-3 space-y-3 text-[13px] font-medium text-slate-200">
            {selectedPlan?.details.map((detail) => (
              <li key={detail} className="flex gap-3">
                <CheckIcon />
                <span>{detail}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <label htmlFor="upgrade-promo-code" className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Promo code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="upgrade-promo-code"
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value.toUpperCase());
                  setAppliedPromoCode(null);
                  setPromoStatus(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyPromoCode();
                  }
                }}
                placeholder="EX: BETA100"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/10 px-3 py-2.5 font-mono text-[10px] text-white placeholder:text-slate-500 focus:border-orange-500/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={applyPromoCode}
                disabled={!promoCode.trim() || promoStatus === "loading"}
                className="shrink-0 rounded-lg border border-white/10 px-4 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-orange-500/35 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {promoStatus === "loading" ? "..." : "Apply"}
              </button>
            </div>
            {promoStatus === "valid" && <p className="mt-2 font-mono text-[9px] text-emerald-400">Code applied to checkout.</p>}
            {promoStatus === "invalid" && <p role="alert" className="mt-2 font-mono text-[9px] text-red-400">Invalid or unavailable code.</p>}
            {promoStatus === "error" && <p role="alert" className="mt-2 font-mono text-[9px] text-red-400">Could not validate the code. Try again.</p>}
          </div>

          {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-center font-mono text-[10px] text-red-300">{error}</p>}
        </div>

        <div className="relative z-20 shrink-0 border-t border-white/[0.06] bg-[#0D1828]/90 px-5 py-4 backdrop-blur-md sm:px-7">
          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-orange-500 py-3.5 font-mono text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_22px_rgba(249,115,22,.25)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Redirecting..." : selectedPlan?.checkoutLabel ?? "Unlock everything"}
          </button>

          <p className="mt-4 text-center font-mono text-[9px] text-slate-600">
            Secure checkout via Stripe. Cancel monthly anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
