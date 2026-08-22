"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PropsFilterDropdown({
  label,
  accessibleLabel = label,
  active,
  onClear,
  onOpenChange,
  panelClassName = "",
  children,
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setPanelStyle(null);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const availableWidth = window.innerWidth - viewportPadding * 2;
    const minWidth = Math.min(280, availableWidth);
    const width = Math.max(rect.width, minWidth);
    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      window.innerWidth - width - viewportPadding,
    );

    setPanelStyle({
      left,
      top: rect.bottom + 8,
      minWidth: width,
      maxWidth: availableWidth,
      maxHeight: `min(520px, calc(100vh - ${Math.ceil(rect.bottom + 20)}px))`,
    });
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        open &&
        !containerRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        closeDropdown();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape" || !open) return;
      closeDropdown();
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDropdown, open]);

  useEffect(() => {
    if (!open) return;

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useLayoutEffect(() => {
    if (!open || !panelStyle || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const viewportPadding = 12;
    const nextLeft = Math.min(
      Math.max(rect.left, viewportPadding),
      window.innerWidth - rect.width - viewportPadding,
    );

    if (nextLeft !== panelStyle.left) {
      setPanelStyle((style) => style ? { ...style, left: nextLeft } : style);
    }
  }, [open, panelStyle]);

  return (
    <div className="relative flex shrink-0 items-stretch" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${accessibleLabel} filter`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          const next = !open;
          if (next) {
            updatePanelPosition();
          } else {
            setPanelStyle(null);
          }
          setOpen(next);
          onOpenChange?.(next);
        }}
        className={`flex min-h-10 items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[12px] font-mono font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
          active
            ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
            : "border-white/[0.08] bg-[#0D1828] text-slate-300 hover:border-white/15"
        }`}
      >
        <span>{label}</span>
        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {active && onClear && (
        <button
          type="button"
          aria-label={`Clear ${accessibleLabel} filter`}
          onClick={onClear}
          className="ml-1 flex w-10 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        >
          <svg aria-hidden="true" width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {open && panelStyle && createPortal(
        <div
          ref={panelRef}
          id={panelId}
          style={panelStyle}
          className={`fixed z-50 min-w-[min(280px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0D1828] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${panelClassName}`}
        >
          {typeof children === "function" ? children(closeDropdown) : children}
        </div>,
        document.body,
      )}
    </div>
  );
}
