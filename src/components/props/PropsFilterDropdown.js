"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function PropsFilterDropdown({
  label,
  accessibleLabel = label,
  active,
  onClear,
  children,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const openRef = useRef(false);
  const panelId = useId();

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        openRef.current = false;
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape" || !openRef.current) return;
      setOpen(false);
      openRef.current = false;
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative flex items-stretch" ref={containerRef}>
      {active && onClear && (
        <button
          type="button"
          aria-label={`Clear ${accessibleLabel} filter`}
          onClick={onClear}
          className="mr-1 flex w-9 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        >
          <svg aria-hidden="true" width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${accessibleLabel} filter`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() =>
          setOpen((current) => {
            openRef.current = !current;
            return !current;
          })
        }
        className={`flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-mono font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
          active
            ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
            : "border-white/[0.08] bg-[#0D1828] text-slate-300 hover:border-white/15"
        }`}
      >
        <span>{label}</span>
        <svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute left-0 top-full z-50 mt-2 min-w-[min(280px,calc(100vw-24px))] rounded-xl border border-white/[0.08] bg-[#0D1828] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}
