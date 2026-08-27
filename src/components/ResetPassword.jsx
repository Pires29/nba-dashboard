"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthInput, AuthLayout } from "@/components/AuthLayout";
import { moveAuthFormFocus } from "@/lib/authFormKeyboard";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const flowId = searchParams.get("flow") || "";
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    const confirm = e.target["confirm-password"].value;

    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 8)
      return setError("Password must be at least 8 characters long");

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to reset password");
        setLoading(false);
        return;
      }

      if (flowId) {
        localStorage.setItem(
          "hoopiq:passwordReset",
          JSON.stringify({ flowId, resetAt: Date.now() }),
        );
        const channel = new BroadcastChannel("hoopiq:auth");
        channel.postMessage({ type: "passwordReset", flowId });
        channel.close();
      }
      setMessage("Password reset successfully. You can close this tab and sign in from the previous page.");
      setLoading(false);
    } catch {
      setError("Connection error");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="New password"
      subtitle="Choose a new password for your account"
      backHref="/login"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        {!token && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
            <p className="text-[11px] font-mono text-red-400">
              Missing reset token.
            </p>
          </div>
        )}

        {!message && (
          <>
            <AuthInput
              id="password"
              type="password"
              label="Password"
              placeholder="Min. 8 characters"
              required
              data-auth-field
              onKeyDown={moveAuthFormFocus}
            />
            <AuthInput
              id="confirm-password"
              type="password"
              label="Confirm Password"
              placeholder="Repeat password"
              required
              data-auth-field
              onKeyDown={moveAuthFormFocus}
            />
          </>
        )}

        {message && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <p className="text-[11px] font-mono text-emerald-300">{message}</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
            <p className="text-[11px] font-mono text-red-400">{error}</p>
          </div>
        )}

        {!message && (
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-lg bg-orange-500 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all duration-150 hover:bg-orange-400 hover:shadow-[0_0_28px_rgba(249,115,22,0.4)] disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        )}

      </form>
    </AuthLayout>
  );
}
