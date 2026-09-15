"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ProductShowcase = dynamic(() => import("./ProductShowcase"), {
  ssr: false,
});

// The showcase contains the heaviest DOM on the landing page and starts below
// the hero. Keep its space reserved to prevent layout shift, but only download
// and build it when the visitor is approaching it.
export default function DeferredProductShowcase() {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || shouldRender) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -45%" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={containerRef}
      aria-busy={!shouldRender}
      className="min-h-[2100px] bg-[#07101b] lg:min-h-[1650px]"
    >
      {shouldRender ? <ProductShowcase /> : null}
    </div>
  );
}
