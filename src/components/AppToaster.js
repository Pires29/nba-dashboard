"use client";

import { useEffect, useState } from "react";

function requestIdle(callback) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 2000);
  return () => window.clearTimeout(id);
}

export default function AppToaster() {
  const [Toaster, setToaster] = useState(null);

  useEffect(() => {
    return requestIdle(() => {
      import("sonner").then((module) => {
        setToaster(() => module.Toaster);
      });
    });
  }, []);

  if (!Toaster) return null;

  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0D1828",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#cbd5e1",
          fontFamily: "monospace",
          fontSize: "12px",
          borderRadius: "12px",
        },
        classNames: {
          success: "!border-emerald-500/20",
          error: "!border-red-500/20",
          description: "!text-slate-600 !text-[11px]",
        },
      }}
    />
  );
}
