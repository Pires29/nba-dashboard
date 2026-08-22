const rows = Array.from({ length: 8 }, (_, index) => index);

export default function FavoritesLoadingState() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg border border-white/[0.08] bg-white/[0.03]" />
          <div className="h-5 w-1 rounded-sm bg-orange-500" />
          <div className="h-5 w-32 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-7 w-16 animate-pulse rounded border border-white/[0.06] bg-white/[0.03]" />
          <div className="ml-auto hidden h-8 w-20 animate-pulse rounded-lg border border-white/[0.08] bg-white/[0.03] md:block" />
          <div className="hidden h-8 w-24 animate-pulse rounded-lg border border-red-500/20 bg-red-500/10 md:block" />
        </div>

        <div className="flex flex-1 items-center justify-center md:hidden">
          <div className="flex h-28 w-[min(420px,calc(100%-32px))] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-400" />
          </div>
        </div>

        <div className="relative hidden flex-1 min-h-0 overflow-hidden rounded-xl border border-white/[0.06] md:block" aria-label="Loading favorites">
          <table className="w-full table-fixed text-left border-collapse">
            <thead className="bg-[#0D1828]">
              <tr className="border-b border-white/[0.06]">
                <th className="w-[280px] px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">Player</th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">Stat</th>
                <th className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">Line</th>
                <th className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">Saved</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.05]" />
                      <div className="min-w-0 space-y-2">
                        <div className="h-3 w-36 animate-pulse rounded bg-white/[0.07]" />
                        <div className="h-2.5 w-8 animate-pulse rounded bg-orange-500/25" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-7 w-16 animate-pulse rounded border border-white/10 bg-white/[0.06]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="ml-auto h-4 w-10 animate-pulse rounded bg-white/[0.08]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="ml-auto h-3 w-10 animate-pulse rounded bg-white/[0.05]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="ml-auto h-4 w-4 animate-pulse rounded bg-orange-500/30" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="absolute inset-0 flex items-center justify-center bg-[#060E1A]/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-500/20 bg-[#0D1828]/90 shadow-[0_0_28px_rgba(249,115,22,0.22)]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
