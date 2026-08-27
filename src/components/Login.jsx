"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AuthLayout,
  AuthInput,
  Divider,
  GoogleIcon,
} from "@/components/AuthLayout";
import { useSearchParams } from "next/navigation";
import { safeInternalPath } from "@/lib/security";
import { moveAuthFormFocus } from "@/lib/authFormKeyboard";

export function LoginForm() {
  const [error, setError] = useState(null);
  const [verificationPrompt, setVerificationPrompt] = useState(null);
  const [notice, setNotice] = useState(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [verificationResendUsed, setVerificationResendUsed] = useState(false);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = safeInternalPath(searchParams.get("callbackUrl"), "/");
  const sessionEnded = searchParams.get("session") === "ended";
  const verificationResendKey = unverifiedEmail
    ? `hoopiq:verificationResent:login:${unverifiedEmail.trim().toLowerCase()}`
    : "";

  useEffect(() => {
    if (!verificationResendKey) return;
    queueMicrotask(() => {
      setVerificationResendUsed(sessionStorage.getItem(verificationResendKey) === "1");
    });
  }, [verificationResendKey]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerificationPrompt(null);
    setNotice(null);
    setUnverifiedEmail("");
    setVerificationResendUsed(false);
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      if (result.error === "EMAIL_NOT_VERIFIED") {
        setVerificationPrompt("Please verify your email before signing in.");
        setUnverifiedEmail(email);
      } else {
        setError("Email ou password incorretos");
      }
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  };

  const resendVerification = async () => {
    if (!unverifiedEmail || verificationResendUsed) return;
    setResending(true);
    setNotice(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerificationPrompt(data.error || "Please wait a bit before trying again.");
        return;
      }

      setNotice(data.message || "If an account needs verification, a verification link has been sent.");
      if (verificationResendKey) sessionStorage.setItem(verificationResendKey, "1");
      setVerificationResendUsed(true);
    } catch {
      setError("Connection error");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:gap-4">
        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="m@example.com"
          required
          data-auth-field
          value={emailValue}
          onChange={(event) => setEmailValue(event.target.value)}
          onKeyDown={moveAuthFormFocus}
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[11px] font-mono uppercase tracking-widest text-slate-500"
            >
              Password
            </label>
            <Link
              href={emailValue ? `/forgot-password?email=${encodeURIComponent(emailValue)}` : "/forgot-password"}
              className="text-[10px] font-mono text-orange-500/70 hover:text-orange-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            data-auth-field
            onKeyDown={moveAuthFormFocus}
            className="w-full rounded-lg border border-white/[0.08] bg-[#0A1120] px-3 py-2 text-sm font-mono text-slate-200 transition-all placeholder:text-slate-700 focus:border-orange-500/40 focus:outline-none focus:ring-1 focus:ring-orange-500/20 sm:py-2.5"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-red-400" />
              <p className="text-[11px] font-mono text-red-400">{error}</p>
            </div>
          </div>
        )}

        {verificationPrompt && (
          <button
            type="button"
            onClick={resendVerification}
            disabled={resending || !unverifiedEmail || verificationResendUsed}
            className="relative w-full cursor-pointer rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 pr-10 text-left transition-colors hover:border-amber-400/35 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <p className="text-[11px] font-mono leading-relaxed text-amber-300">
              {verificationPrompt}
            </p>
            <span className="mt-2 block font-mono text-[11px] text-white">
              {resending
                ? "Sending..."
                : verificationResendUsed
                  ? "Verification email sent"
                  : "Resend verification email"}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
            >
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {notice && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <p className="text-[11px] font-mono leading-relaxed text-emerald-300">
              {notice}
            </p>
          </div>
        )}

        {sessionEnded && !error && !notice && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
            <p className="text-[11px] font-mono leading-relaxed text-amber-300">
              Your session ended. Please sign in again.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all duration-150 hover:bg-orange-400 hover:shadow-[0_0_28px_rgba(249,115,22,0.4)] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <Divider />

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#0A1120] py-2.5 font-mono text-[12px] uppercase tracking-widest text-slate-400 transition-all duration-150 hover:border-white/20 hover:text-white"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center text-[11px] font-mono text-slate-600 mt-1">
          No account?{" "}
          <Link
            href={callbackUrl === "/" ? "/signup" : `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="text-orange-500/70 hover:text-orange-400 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
