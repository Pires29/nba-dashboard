"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthInput, AuthLayout } from "@/components/AuthLayout";

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = useMemo(() => crypto.randomUUID(), []);
  const [emailValue, setEmailValue] = useState(searchParams.get("email") || "");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("hoopiq:auth");
    const handleMessage = (event) => {
      if (event.data?.type === "passwordReset" && event.data.flowId === flowId) {
        router.replace("/login");
      }
    };
    const handleStorage = (event) => {
      if (event.key !== "hoopiq:passwordReset") return;

      try {
        const payload = JSON.parse(event.newValue || "{}");
        if (payload.flowId === flowId) router.replace("/login");
      } catch {
        return;
      }
    };

    channel.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      channel.close();
    };
  }, [flowId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e.target.email.value, flowId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Please try again later");
        setLoading(false);
        return;
      }

      localStorage.removeItem("hoopiq:passwordReset");
      setMessage(data.message);
      setLoading(false);
    } catch {
      setError("Connection error");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and check your inbox"
      backHref="/login"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        <p className="text-[11px] font-mono leading-relaxed text-slate-500">
          It can take a few minutes to arrive. Check your spam folder too.
        </p>

        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="m@example.com"
          required
          value={emailValue}
          onChange={(event) => setEmailValue(event.target.value)}
        />

        {message && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <p className="text-[11px] font-mono leading-relaxed text-emerald-300">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
            <p className="text-[11px] font-mono text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all duration-150 hover:bg-orange-400 hover:shadow-[0_0_28px_rgba(249,115,22,0.4)] disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-center text-[11px] font-mono text-slate-600">
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-orange-500/70 transition-colors hover:text-orange-400"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
