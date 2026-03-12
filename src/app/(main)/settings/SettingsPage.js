"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

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

const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    />

    {/* Modal */}
    <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-red-500/20 bg-[#0D1828] shadow-[0_0_60px_rgba(239,68,68,0.15)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-red-400 to-transparent" />

      <div className="p-6">
        {/* Icon */}
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
          Apagar conta?
        </h2>
        <p className="text-[12px] font-mono text-slate-500 text-center leading-relaxed mb-6">
          Esta ação é <span className="text-red-400">irreversível</span>. Todos
          os teus dados serão permanentemente eliminados.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-[11px] font-mono uppercase tracking-widest transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-[11px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function SettingsPage({ session }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const user = session?.user;
  const isGoogle = !!(user?.image && user.image.includes("google"));
  const plan = user?.plan ?? "free";
  const isPro = plan === "pro";

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        console.error(
          "Erro ao apagar conta:",
          data.error,
          "status:",
          res.status,
        );
        return;
      }

      setShowDeleteModal(false);
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      {/* Grid texture */}
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
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 mb-2">
            Conta
          </p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Settings
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          {/* ── SECÇÃO CONTA ── */}
          <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#162035] to-[#0F1828] p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

            <SectionLabel>Informações da conta</SectionLabel>

            {/* Avatar + nome */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.04]">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
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
            <InfoRow label="ID" value={user?.id} />
            <InfoRow
              label="Método de login"
              value={isGoogle ? "Google OAuth" : "Email + Password"}
            />
          </div>

          {/* ── SECÇÃO PLANO ── */}
          <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#162035] to-[#0F1828] p-6 overflow-hidden">
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${isPro ? "from-orange-500 via-amber-400" : "from-slate-600 via-slate-500"} to-transparent`}
            />

            <SectionLabel>Plano</SectionLabel>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest ${isPro ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "bg-slate-700/50 text-slate-400 border border-white/10"}`}
                  >
                    {isPro ? "Pro" : "Free"}
                  </span>
                  {isPro && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Plano ativo
                    </span>
                  )}
                </div>
                {isPro ? (
                  <p className="text-[12px] font-mono text-slate-500">
                    Renovação a <span className="text-slate-300">—</span>
                    {/* TODO: substituir por data real do Stripe */}
                  </p>
                ) : (
                  <p className="text-[12px] font-mono text-slate-500">
                    Faz upgrade para aceder a todas as features
                  </p>
                )}
              </div>
            </div>

            {isPro ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400/50 text-[11px] font-mono uppercase tracking-widest cursor-not-allowed opacity-50"
              >
                {/* TODO: ligar ao Stripe para cancelar subscrição */}
                Cancelar subscrição
              </button>
            ) : (
              <a
                href="/pricing"
                className="block w-full py-2.5 rounded-xl text-center bg-orange-500 hover:bg-orange-400 text-white text-[11px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
              >
                Upgrade para Pro →
              </a>
            )}
          </div>

          {/* ── DANGER ZONE ── */}
          <div className="relative rounded-2xl border border-red-500/10 bg-gradient-to-b from-[#1a0f0f] to-[#0F1828] p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent" />

            <SectionLabel>Danger zone</SectionLabel>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-mono text-slate-300 mb-1">
                  Apagar conta
                </p>
                <p className="text-[11px] font-mono text-slate-600">
                  Remove permanentemente a tua conta e todos os dados
                  associados.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="ml-4 flex-shrink-0 px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 text-red-400 text-[11px] font-mono uppercase tracking-widest transition-all"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
