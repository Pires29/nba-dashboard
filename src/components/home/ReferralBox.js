"use client";

import { useState } from "react";
import { captureEvent } from "@/components/PostHogProvider";
import { PAID_PLAN_PRICES, REFERRAL_DISCOUNT } from "@/lib/pricingPlans";

function updateDisplayedPrices(hasDiscount) {
  for (const [plan, price] of Object.entries(PAID_PLAN_PRICES)) {
    const priceElement = document.querySelector(`[data-plan-price="${plan}"]`);
    const originalPriceElement = document.querySelector(`[data-referral-original-price="${plan}"]`);
    if (!priceElement || !originalPriceElement) continue;

    priceElement.textContent = (hasDiscount ? price * (1 - REFERRAL_DISCOUNT) : price).toFixed(2);
    originalPriceElement.classList.toggle("hidden", !hasDiscount);
  }
}

function notifyReferralCode(code) {
  window.dispatchEvent(new CustomEvent("home-referral-applied", { detail: { code } }));
}

export default function ReferralBox() {
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState(null);

  async function validateReferral() {
    if (!referralCode.trim()) return;
    setReferralStatus("loading");
    try {
      const response = await fetch("/api/referral/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralCode }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.valid) {
        const normalizedCode = referralCode.trim().toUpperCase();
        setReferralStatus("valid");
        notifyReferralCode(normalizedCode);
        updateDisplayedPrices(true);
        captureEvent("referral_applied", { code: normalizedCode });
      } else {
        setReferralStatus("invalid");
        notifyReferralCode(null);
        updateDisplayedPrices(false);
      }
    } catch {
      setReferralStatus("error");
      notifyReferralCode(null);
      updateDisplayedPrices(false);
    }
  }

  return (
    <div className="mx-auto mt-7 max-w-md rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <label htmlFor="home-referral" className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Have a referral code?</label>
      <div className="mt-2 flex gap-2">
        <input
          id="home-referral"
          value={referralCode}
          onChange={(event) => {
            setReferralCode(event.target.value.toUpperCase());
            setReferralStatus(null);
            notifyReferralCode(null);
            updateDisplayedPrices(false);
          }}
          onKeyDown={(event) => event.key === "Enter" && validateReferral()}
          placeholder="EX: JOAO20"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/10 px-3 py-2 font-mono text-[10px] text-white placeholder:text-slate-400"
        />
        <button onClick={validateReferral} disabled={!referralCode || referralStatus === "loading"} className="rounded-lg border border-white/10 px-4 font-mono text-[9px] uppercase text-slate-400 disabled:opacity-40">
          {referralStatus === "loading" ? "..." : "Apply"}
        </button>
      </div>
      {referralStatus === "valid" && <p className="mt-2 font-mono text-[9px] text-emerald-400">Code applied to checkout.</p>}
      {referralStatus === "invalid" && <p role="alert" className="mt-2 font-mono text-[9px] text-red-400">Invalid or unavailable code.</p>}
      {referralStatus === "error" && <p role="alert" className="mt-2 font-mono text-[9px] text-red-400">Could not validate the code. Try again.</p>}
    </div>
  );
}
