"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";

export function VerifyRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const flowId = searchParams.get("flow") || "";
  const callbackUrl = searchParams.get("callbackUrl");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const resendStorageKey = flowId ? `hoopiq:verificationResent:${flowId}` : "";
  const [resendUsed, setResendUsed] = useState(false);

  useEffect(() => {
    if (!resendStorageKey) return;
    queueMicrotask(() => {
      setResendUsed(sessionStorage.getItem(resendStorageKey) === "1");
    });
  }, [resendStorageKey]);

  const resend = async () => {
    if (resendUsed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, flowId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Please try again later");
        setLoading(false);
        return;
      }

      setMessage(data.message);
      if (resendStorageKey) sessionStorage.setItem(resendStorageKey, "1");
      setResendUsed(true);
      setLoading(false);
    } catch {
      setError("Connection error");
      setLoading(false);
    }
  };

  const loginHref = useMemo(
    () =>
      callbackUrl
        ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/login",
    [callbackUrl],
  );

  useEffect(() => {
    const channel = new BroadcastChannel("hoopiq:auth");
    const handleMessage = (event) => {
      if (event.data?.type !== "emailVerified") return;
      if (flowId && event.data.flowId !== flowId) return;
      if (email && event.data.email?.toLowerCase() !== email.toLowerCase()) {
        return;
      }
      router.replace(loginHref);
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [email, flowId, loginHref, router]);

  return (
    <AuthLayout
      title="Check your email"
      subtitle="Verify your email before signing in"
      backHref={loginHref}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-3">
          <p className="text-[11px] font-mono leading-relaxed text-emerald-300">
            {message || `We sent a verification link${email ? ` to ${email}` : ""}.`}
          </p>
          <p className="mt-2 text-[11px] font-mono leading-relaxed text-slate-400">
            It can take a few minutes to arrive. Check your spam folder too.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
            <p className="text-[11px] font-mono text-red-400">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={resend}
          disabled={loading || !email || resendUsed}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all duration-150 hover:bg-orange-400 hover:shadow-[0_0_28px_rgba(249,115,22,0.4)] disabled:cursor-not-allowed disabled:text-white disabled:opacity-70"
        >
          {resendUsed && (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 text-white"
            >
              <path
                d="m5 12 4 4L19 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span>
            {loading ? "Sending..." : resendUsed ? "Verification email sent" : "Resend email"}
          </span>
        </button>

        <p className="text-center text-[11px] font-mono text-slate-600">
          Already verified?{" "}
          <Link
            href={loginHref}
            className="text-orange-500/70 transition-colors hover:text-orange-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
