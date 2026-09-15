"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CheckoutButton = dynamic(() => import("./CheckoutButton"), { ssr: false });
const ReferralBox = dynamic(() => import("./ReferralBox"), { ssr: false });

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

export function DeferredCheckoutButton(props) {
  const [ref, isNear] = useNearViewport();
  const { billing, disabled, featured, labelOverride } = props;

  return (
    <div ref={ref}>
      {isNear ? <CheckoutButton {...props} /> : (
        <button
          type="button"
          disabled
          className={`w-full rounded-xl py-3.5 font-mono text-[10px] font-black uppercase tracking-widest opacity-45 ${featured ? "bg-orange-500 text-white shadow-[0_0_25px_rgba(249,115,22,.25)]" : "border border-white/15 bg-white/[0.03] text-slate-200"}`}
        >
          {checkoutLabel(billing, labelOverride)}
        </button>
      )}
    </div>
  );
}

export function DeferredReferralBox() {
  const [ref, isNear] = useNearViewport();

  return (
    <div ref={ref}>
      {isNear ? <ReferralBox /> : <div className="mx-auto mt-7 h-[82px] max-w-md rounded-xl border border-white/[0.07] bg-white/[0.02]" />}
    </div>
  );
}
