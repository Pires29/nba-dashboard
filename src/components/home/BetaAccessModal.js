"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { launchConfig } from "@/config/launch";
import TurnstileWidget, { isTurnstileEnabled } from "@/components/TurnstileWidget";
import { signOutWithBetaCleanup } from "@/lib/signOutWithBetaCleanup";

const INITIAL_STATUS = { type: "idle", message: "" };
const WAITLIST_JOINED_STORAGE_KEY = "hoopiq:waitlist-joined";

function redemptionErrorDetails(error) {
  if (error.status === 403) {
    return {
      title: "This code belongs to another account",
      description:
        "Sign in with the email address that received this beta invitation, then enter the code again.",
      action: "signout",
    };
  }

  if (error.status === 400) {
    return {
      title: "Your beta code confirmation expired",
      description: "Enter the beta code again to start a new confirmation.",
      action: "retry",
    };
  }

  if (error.status === 409) {
    return {
      title: "This beta code has already been used",
      description: "Request a new code if you still need access to the beta.",
      action: "retry",
    };
  }

  return {
    title: "Beta access could not be confirmed",
    description: error.message || "Please try again in a moment.",
    action: "retry",
  };
}

export default function BetaAccessModal({
  isOpen,
  onClose,
  processBetaRedemption = false,
  redirectTo = "/props",
}) {
  const router = useRouter();
  const [mode, setMode] = useState("waitlist");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [redemptionStage, setRedemptionStage] = useState("idle");
  const [redemptionError, setRedemptionError] = useState(null);
  const hasStartedRedemption = useRef(false);

  const redeemBetaAccess = useCallback(async (destination) => {
    setRedemptionError(null);
    setRedemptionStage("processing");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/beta/redeem", { method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        setRedemptionError({
          status: response.status,
          message: result.error || "Unable to redeem beta access",
        });
        setRedemptionStage("error");
        return;
      }
      window.location.replace(destination);
    } catch (error) {
      setRedemptionError({ message: error.message });
      setRedemptionStage("error");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    if (processBetaRedemption && !hasStartedRedemption.current) {
      hasStartedRedemption.current = true;
      setMode("code");
      redeemBetaAccess(redirectTo);
    }
    try {
      setHasJoinedWaitlist(
        window.localStorage.getItem(WAITLIST_JOINED_STORAGE_KEY) === "true",
      );
    } catch {
      // Local storage may be unavailable because of browser privacy settings.
    }
  }, [processBetaRedemption, redirectTo, redeemBetaAccess]);

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
        const redeemPath = `/?beta=redeem&callbackUrl=${encodeURIComponent(redirectTo)}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(redeemPath)}`);
        return;
      }
      await redeemBetaAccess(redirectTo);
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

  function returnToCodeEntry() {
    hasStartedRedemption.current = false;
    setRedemptionStage("idle");
    setRedemptionError(null);
    setCode("");
  }

  return (
    isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="beta-access-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b1421] text-white shadow-2xl">
            {redemptionStage !== "idle" ? (
              <div className="px-6 py-8 text-center sm:px-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400">
                  Closed beta access
                </p>
                {redemptionStage === "processing" ? (
                  <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/20 bg-orange-500/[0.08]">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
                  </div>
                ) : (
                  <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full border border-red-400/20 bg-red-400/[0.08] text-xl text-red-300">
                    !
                  </div>
                )}
                <h2 id="beta-access-title" className="mt-5 text-xl font-black">
                  {redemptionStage === "processing"
                    ? "Confirming beta access"
                    : redemptionErrorDetails(redemptionError).title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-400" role={redemptionStage === "error" ? "alert" : "status"}>
                  {redemptionStage === "processing"
                    ? "We are linking your beta code to this account. You will be redirected automatically."
                    : redemptionErrorDetails(redemptionError).description}
                </p>
                {redemptionStage === "error" ? (
                  <div className="mt-6 space-y-3">
                    {redemptionErrorDetails(redemptionError).action === "signout" ? (
                      <button
                        type="button"
                        onClick={() => signOutWithBetaCleanup({ callbackUrl: "/" })}
                        className="w-full rounded-lg bg-orange-500 px-4 py-3 font-mono text-xs font-black uppercase tracking-widest text-white transition hover:bg-orange-400"
                      >
                        Sign out and use invited email
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={returnToCodeEntry}
                        className="w-full rounded-lg bg-orange-500 px-4 py-3 font-mono text-xs font-black uppercase tracking-widest text-white transition hover:bg-orange-400"
                      >
                        Try another beta code
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
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
                onClick={onClose}
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
                  className={`rounded-md px-3 py-2 text-center font-mono text-[10px] font-black uppercase tracking-widest transition ${mode === "waitlist" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}
                  onClick={() => {
                    setMode("waitlist");
                    setStatus(INITIAL_STATUS);
                    setTurnstileToken("");
                  }}
                >
                  Join the waitlist
                </button>
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
                    {isSubmitting ? "Confirming access..." : "Unlock beta"}
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

              {status.message && !(mode === "waitlist" && hasJoinedWaitlist) ? (
                <div className="mt-4">
                  <p
                    className={`text-sm ${status.type === "error" ? "text-red-400" : "text-slate-400"}`}
                    role={status.type === "error" ? "alert" : "status"}
                  >
                    {status.message}
                  </p>
                </div>
              ) : null}
                </div>
              </>
            )}
          </div>
        </div>
    ) : null
  );
}
