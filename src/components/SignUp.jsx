"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthLayout,
  AuthInput,
  Divider,
  GoogleIcon,
} from "@/components/AuthLayout";
import { safeInternalPath } from "@/lib/security";

export function SignupForm() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeInternalPath(searchParams.get("callbackUrl"), "/");

  const handleSignup = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target["confirm-password"].value;

    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 8)
      return setError("Password must be at least 8 characters long");

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email))
      return setError("Please enter a valid email address");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Account created — sign in automatically
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Account created, but sign-in failed");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Connection error");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join to access NBA stats & player props"
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-3 sm:gap-4">
        <AuthInput
          id="name"
          type="text"
          label="Full Name"
          placeholder="John Doe"
          required
        />
        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="m@example.com"
          required
        />
        <AuthInput
          id="password"
          type="password"
          label="Password"
          placeholder="Min. 8 characters"
          required
        />
        <AuthInput
          id="confirm-password"
          type="password"
          label="Confirm Password"
          placeholder="Repeat password"
          required
        />

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-1 h-1 rounded-full bg-red-400" />
            <p className="text-[11px] font-mono text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all duration-150 hover:bg-orange-400 hover:shadow-[0_0_28px_rgba(249,115,22,0.4)] disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center font-mono text-[10px] leading-relaxed text-slate-600">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="text-orange-500/70 hover:text-orange-400 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-orange-500/70 hover:text-orange-400 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>

        <Divider />

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#0A1120] py-2.5 font-mono text-[12px] uppercase tracking-widest text-slate-400 transition-all duration-150 hover:border-white/20 hover:text-white"
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="mt-0 text-center font-mono text-[11px] text-slate-600 sm:mt-1">
          Already have an account?{" "}
          <Link
            href={callbackUrl === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="text-orange-500/70 hover:text-orange-400 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
