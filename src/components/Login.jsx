"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
  AuthLayout,
  AuthInput,
  Divider,
  GoogleIcon,
} from "@/components/AuthLayout";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError("Email ou password incorretos");
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="m@example.com"
          required
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[11px] font-mono uppercase tracking-widest text-slate-500"
            >
              Password
            </label>
            <a
              href="#"
              className="text-[10px] font-mono text-orange-500/70 hover:text-orange-400 transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            required
            className="w-full px-3 py-2.5 rounded-lg bg-[#0A1120] border border-white/[0.08] text-slate-200 text-sm font-mono placeholder:text-slate-700 focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-1 h-1 rounded-full bg-red-400" />
            <p className="text-[11px] font-mono text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-[12px] font-mono font-bold uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)]"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <Divider />

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-2.5 rounded-lg bg-[#0A1120] border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white text-[12px] font-mono uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center text-[11px] font-mono text-slate-600 mt-1">
          No account?{" "}
          <Link
            href="/signup"
            className="text-orange-500/70 hover:text-orange-400 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
