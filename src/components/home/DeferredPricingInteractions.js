"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

// Do not preload checkout, referral, or analytics code with the landing page.
// React starts these imports only after the pricing controls are near the viewport.
const CheckoutButton = lazy(() => import("./CheckoutButton"));
const ReferralBox = lazy(() => import("./ReferralBox"));

function useNearViewport() {
  const ref = useRef(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isNear) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsNear(true);
      observer.disconnect();
    }, { rootMargin: "500px 0px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, [isNear]);

  return [ref, isNear];
}

function checkoutLabel(billing, labelOverride) {
  if (labelOverride) return labelOverride;
  if (billing === "trial") return "Start Free Trial";
  if (billing === "monthly") return "Choose Monthly";
  return "Get Season Pass";
}

function CheckoutPlaceholder({ billing, featured, labelOverride }) {
  return (
    <button
      type="button"
      disabled
      className={`w-full rounded-xl py-3.5 font-mono text-[10px] font-black uppercase tracking-widest opacity-45 ${featured ? "bg-orange-500 text-white shadow-[0_0_25px_rgba(249,115,22,.25)]" : "border border-white/15 bg-white/[0.03] text-slate-200"}`}
    >
      {checkoutLabel(billing, labelOverride)}
    </button>
  );
}

export function DeferredCheckoutButton(props) {
  const [ref, isNear] = useNearViewport();
  const { billing, disabled, featured, labelOverride } = props;

  return (
    <div ref={ref}>
      {isNear ? (
        <Suspense fallback={<CheckoutPlaceholder billing={billing} featured={featured} labelOverride={labelOverride} />}>
          <CheckoutButton {...props} />
        </Suspense>
      ) : <CheckoutPlaceholder billing={billing} featured={featured} labelOverride={labelOverride} />}
    </div>
  );
}

export function DeferredReferralBox() {
  const [ref, isNear] = useNearViewport();

  return (
    <div ref={ref}>
      {isNear ? (
        <Suspense fallback={<div className="mx-auto mt-7 h-[82px] max-w-md rounded-xl border border-white/[0.07] bg-white/[0.02]" />}>
          <ReferralBox />
        </Suspense>
      ) : <div className="mx-auto mt-7 h-[82px] max-w-md rounded-xl border border-white/[0.07] bg-white/[0.02]" />}
    </div>
  );
}
