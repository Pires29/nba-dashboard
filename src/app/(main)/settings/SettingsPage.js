// settings-page.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PricingLink from "@/components/PricingLink";
import { captureEvent } from "@/components/PostHogProvider";

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-1 h-5 rounded-sm bg-orange-500" />
    <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
      {children}
    </span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
    <span className="text-[11px] font-mono uppercase tracking-widest text-slate-600">
      {label}
    </span>
    <span className="text-[13px] font-mono text-slate-300">{value || "—"}</span>
  </div>
);

const DeleteModal = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-red-500/20 bg-[#0D1828] shadow-[0_0_60px_rgba(239,68,68,0.15)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-red-400 to-transparent" />
      <div className="p-6">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polyline
              points="3 6 5 6 21 6"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10 11v6M14 11v6"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-black text-white text-center mb-2">
          Delete account?
        </h2>
        <p className="text-[12px] font-mono text-slate-500 text-center leading-relaxed mb-6">
          This action is <span className="text-red-400">irreversible</span>. All
          your data will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-[11px] font-mono uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-[11px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CancelModal = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-orange-500/20 bg-[#0D1828] shadow-[0_0_60px_rgba(249,115,22,0.1)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-transparent" />
      <div className="p-6">
        <h2 className="text-lg font-black text-white text-center mb-2">
          Cancel subscription?
        </h2>
        <p className="text-[12px] font-mono text-slate-500 text-center leading-relaxed mb-6">
          You&apos;ll keep Pro access until the end of your current period.
          After that you&apos;ll switch to the Free plan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-[11px] font-mono uppercase tracking-widest transition-all"
          >
            Keep Pro
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-orange-500/30 hover:bg-orange-500/10 text-orange-400 text-[11px] font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function SettingsPage({ session }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const router = useRouter();

  const user = session?.user;
  const isGoogle = !!(user?.image && user.image.includes("google"));
  const plan = user?.plan ?? "free";
  const isPro = plan === "pro";
  const isTrial = plan === "trial";
  const hasSubscription = isPro || isTrial;
  const isSeasonPlan = isPro && user?.planInterval === "season";

  const renewsAt = user?.planRenewsAt
    ? new Date(user.planRenewsAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Unable to delete the account");
        return;
      }
      setShowDeleteModal(false);
      await signOut({ callbackUrl: "/?signedOut=1" });
    } catch (err) {
      setActionError("Unable to connect. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      if (res.ok) {
        captureEvent("subscription_cancelled", {
          plan_interval: user?.planInterval ?? null,
        });
        setCancelled(true);
        setShowCancelModal(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || "Unable to cancel the subscription");
      }
    } catch (err) {
      setActionError("Unable to connect. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSeasonUpgrade = async () => {
    setSeasonLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing: "season" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        captureEvent("checkout_started", {
          billing: "season",
          source: "settings",
        });
        window.location.href = data.url;
        return;
      }
      setActionError(data.error || "Unable to start season checkout");
    } catch (err) {
      setActionError("Unable to connect. Please try again.");
    } finally {
      setSeasonLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-orange-500/4 blur-[120px] pointer-events-none" />

      <div className="max-w-[640px] mx-auto px-6 py-12 relative z-10">
        <div className="mb-10 flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/props")}
            aria-label="Back to props"
            className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-colors hover:border-orange-500/35 hover:bg-orange-500/10 hover:text-orange-200"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 mb-2">
              Account
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Settings
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Account */}
          <div className="relative rounded-2xl border border-white/6 bg-gradient-to-b from-[#162035] to-[#0F1828] p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
            <SectionLabel>Account information</SectionLabel>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.04]">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full border-2 border-white/10 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center">
                  <span className="text-lg font-black text-orange-400">
                    {user?.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
              <div>
                <p className="text-lg font-black text-white">
                  {user?.name ?? "—"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${isGoogle ? "bg-blue-500/15 text-blue-400" : "bg-slate-700/50 text-slate-400"}`}
                  >
                    {isGoogle ? "Google" : "Credentials"}
                  </span>
                </div>
              </div>
            </div>
            <InfoRow label="Email" value={user?.email} />
            <InfoRow
              label="Login method"
              value={isGoogle ? "Google OAuth" : "Email + Password"}
            />
          </div>

          {/* Plan */}
          <div className="relative rounded-2xl border border-white/6 bg-gradient-to-b from-[#162035] to-[#0F1828] p-6 overflow-hidden">
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${hasSubscription ? "from-orange-500 via-amber-400" : "from-slate-600 via-slate-500"} to-transparent`}
            />
            <SectionLabel>Plan</SectionLabel>

            <div className="mb-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest ${hasSubscription ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "bg-slate-700/50 text-slate-400 border border-white/10"}`}
                  >
                    {isTrial
                      ? "Trial"
                      : isSeasonPlan
                        ? "Season Pass"
                        : isPro
                          ? "Pro"
                          : "Free"}
                  </span>
                  {hasSubscription && !cancelled && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Active plan
                    </span>
                  )}
                  {cancelled && (
                    <span className="text-[10px] font-mono text-yellow-500">
                      Cancels at end of period
                    </span>
                  )}
                </div>
                {isSeasonPlan && renewsAt && (
                  <div className="space-y-1">
                    <p className="text-[12px] font-mono text-slate-500">
                      Season access until <span className="text-slate-300">{renewsAt}</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-600">
                      One-time payment · No automatic renewal
                    </p>
                  </div>
                )}
                {hasSubscription && !isSeasonPlan && renewsAt && !cancelled && (
                  <p className="text-[12px] font-mono text-slate-500">
                    {isTrial ? "Trial ends" : "Renews"} on <span className="text-slate-300">{renewsAt}</span>
                  </p>
                )}
                {hasSubscription && !isSeasonPlan && renewsAt && cancelled && (
                  <p className="text-[12px] font-mono text-slate-500">
                    Pro access until{" "}
                    <span className="text-slate-300">{renewsAt}</span>
                  </p>
                )}
                {!hasSubscription && (
                  <p className="text-[12px] font-mono text-slate-500">
                    Upgrade to access all features
                  </p>
                )}
              </div>
            </div>

            {hasSubscription && !isSeasonPlan && !cancelled ? (
              <div className="space-y-2.5">
                <button
                  onClick={handleSeasonUpgrade}
                  disabled={seasonLoading}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-[11px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.22)]"
                >
                  {seasonLoading ? "Redirecting..." : "Upgrade to Season Pass"}
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/30 hover:bg-red-500/5 text-red-400 text-[11px] font-mono uppercase tracking-widest transition-all"
                >
                  Cancel subscription
                </button>
                <p className="text-[10px] font-mono leading-relaxed text-slate-600">
                  Cancelling keeps Pro access until{" "}
                  <span className="text-slate-400">
                    {renewsAt ?? "the end of your current period"}
                  </span>
                  .
                </p>
              </div>
            ) : !hasSubscription ? (
              <PricingLink
                className="block w-full py-2.5 rounded-xl text-center bg-orange-500 hover:bg-orange-400 text-white text-[11px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
              >
                Upgrade to Pro →
              </PricingLink>
            ) : null}
          </div>

          {/* Danger zone */}
          <div className="relative rounded-2xl border border-red-500/10 bg-gradient-to-b from-[#1a0f0f] to-[#0F1828] p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent" />
            <SectionLabel>Danger zone</SectionLabel>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-mono text-slate-300 mb-1">
                  Delete account
                </p>
                <p className="text-[11px] font-mono text-slate-600">
                  Permanently removes your account and all associated data.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="ml-4 flex-shrink-0 px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 text-red-400 text-[11px] font-mono uppercase tracking-widest transition-all"
              >
                Delete
              </button>
            </div>
          </div>
          {actionError && (
            <p role="alert" className="text-center text-[11px] font-mono text-red-400">
              {actionError}
            </p>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelSubscription}
          onCancel={() => setShowCancelModal(false)}
          loading={cancelLoading}
        />
      )}
    </div>
  );
}
