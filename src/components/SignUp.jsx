"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  AuthLayout,
  AuthInput,
  Divider,
  GoogleIcon,
} from "@/components/AuthLayout";

export function SignupForm() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target["confirm-password"].value;

    if (password !== confirm) return setError("As passwords não coincidem");
    if (password.length < 8)
      return setError("Password deve ter pelo menos 8 caracteres");

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
        setError(data.error || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Conta criada — faz login automático
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Conta criada mas erro ao fazer login");
        setLoading(false);
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Erro de ligação");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join to access NBA stats & player props"
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
          className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-[12px] font-mono font-bold uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)]"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <Divider />

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-2.5 rounded-lg bg-[#0A1120] border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white text-[12px] font-mono uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="text-center text-[11px] font-mono text-slate-600 mt-1">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-500/70 hover:text-orange-400 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
