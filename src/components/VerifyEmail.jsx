"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const flowId = searchParams.get("flow") || "";
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const verifiedTokenRef = useRef(null);

  useEffect(() => {
    async function verify() {
      if (verifiedTokenRef.current === token) return;
      verifiedTokenRef.current = token;

      if (!token) {
        setStatus("error");
        setError("Missing verification token.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setError(data.error || "Unable to verify email");
          return;
        }

        if (data.email) {
          const channel = new BroadcastChannel("hoopiq:auth");
          channel.postMessage({
            type: "emailVerified",
            email: data.email,
            flowId,
          });
          channel.close();
        }
        setStatus("success");
      } catch {
        setStatus("error");
        setError("Connection error");
      }
    }

    verify();
  }, [flowId, token]);

  return (
    <AuthLayout
      title="Email verification"
      subtitle="Finishing your account setup"
      backHref="/login"
    >
      <div className="flex flex-col gap-4">
        {status === "loading" && (
          <div className="rounded-lg border border-white/[0.08] bg-[#0A1120] px-3 py-2">
            <p className="text-[11px] font-mono text-slate-400">
              Verifying email...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <p className="text-[11px] font-mono leading-relaxed text-emerald-300">
              Email verified. You can close this tab and sign in from the
              previous page.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
            <p className="text-[11px] font-mono text-red-400">{error}</p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
