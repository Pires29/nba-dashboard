"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { launchConfig } from "@/config/launch";
import TurnstileWidget, { isTurnstileEnabled } from "@/components/TurnstileWidget";

const INITIAL_STATUS = { type: "idle", message: "" };
const WAITLIST_JOINED_STORAGE_KEY = "hoopiq:waitlist-joined";

export default function BetaAccessModal({
  className = "",
  children = launchConfig.cta.primary,
  ...buttonProps
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("code");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/props");
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
      setRedirectTo(callbackUrl);
    }
    if (searchParams.get("beta") === "required") {
      setIsOpen(true);
    }
    try {
      setHasJoinedWaitlist(
        window.localStorage.getItem(WAITLIST_JOINED_STORAGE_KEY) === "true",
      );
    } catch {
      // Local storage may be unavailable because of browser privacy settings.
    }
  }, []);

  async function submitBetaCode(event) {
    event.preventDefault();
    setStatus(INITIAL_STATUS);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/beta/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Invalid beta code");
      if (result.requiresSignIn) {
        const redeemPath = `/beta/redeem?callbackUrl=${encodeURIComponent(redirectTo)}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(redeemPath)}`);
        return;
      }
      router.push(`/beta/redeem?callbackUrl=${encodeURIComponent(redirectTo)}`);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitWaitlist(event) {
    event.preventDefault();
    setStatus(INITIAL_STATUS);
    setIsSubmitting(true);

    if (isTurnstileEnabled() && !turnstileToken) {
      setStatus({ type: "error", message: "Please complete the verification challenge" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/beta/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to join the waitlist");
      setEmail("");
      setHasJoinedWaitlist(true);
      try {
        window.localStorage.setItem(WAITLIST_JOINED_STORAGE_KEY, "true");
      } catch {
        // The in-memory state still prevents a duplicate submission this visit.
      }
      setStatus({
        type: "success",
        message: launchConfig.betaModal.waitlistSuccess,
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen(true)}
        {...buttonProps}
      >
        {children}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="beta-access-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b1421] text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400">
                  {launchConfig.betaModal.eyebrow}
                </p>
                <h2 id="beta-access-title" className="mt-2 text-xl font-black">
                  {launchConfig.betaModal.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close beta access modal"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:border-white/20 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm leading-6 text-slate-400">
                {launchConfig.betaModal.description}
              </p>
              {launchConfig.betaModal.perkText ? (
                <p className="mt-3 rounded-lg border border-orange-500/20 bg-orange-500/[0.08] px-3 py-2 font-mono text-[10px] font-bold uppercase leading-5 tracking-widest text-orange-300">
                  {launchConfig.betaModal.perkText}
                </p>
              ) : null}

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-white/[0.07] bg-black/15 p-1">
                <button
                  type="button"
                  className={`rounded-md px-3 py-2 text-center font-mono text-[10px] font-black uppercase tracking-widest transition ${mode === "code" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}
                  onClick={() => {
                    setMode("code");
                    setStatus(INITIAL_STATUS);
                    setTurnstileToken("");
                  }}
                >
                  I have a beta code
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-2 text-center font-mono text-[10px] font-black uppercase tracking-widest transition ${mode === "waitlist" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}
                  onClick={() => {
                    setMode("waitlist");
                    setStatus(INITIAL_STATUS);
                    setTurnstileToken("");
                  }}
                >
                  Join the waitlist
                </button>
              </div>

              {mode === "code" ? (
                <form className="mt-5 space-y-3" onSubmit={submitBetaCode}>
                  <label className="block">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Beta code
                    </span>
                    <input
                      type="text"
                      maxLength={128}
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#060b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500/60"
                      placeholder="Enter your access code"
                      autoComplete="off"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-orange-500 px-4 py-3 font-mono text-xs font-black uppercase tracking-widest text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Checking..." : "Unlock beta"}
                  </button>
                </form>
              ) : hasJoinedWaitlist ? (
                <div className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm text-emerald-400">
                  {launchConfig.betaModal.waitlistSuccess}
                </div>
              ) : (
                <form className="mt-5 space-y-3" onSubmit={submitWaitlist}>
                  <label className="block">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Email
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#060b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500/60"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                  <TurnstileWidget
                    onVerify={setTurnstileToken}
                    onExpire={() => setTurnstileToken("")}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-orange-500 px-4 py-3 font-mono text-xs font-black uppercase tracking-widest text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "Request access"}
                  </button>
                </form>
              )}

              {status.message && !hasJoinedWaitlist ? (
                <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {status.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
