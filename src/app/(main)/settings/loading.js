const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-white/[0.06] ${className}`} />
);

const SectionLabelSkeleton = () => (
  <div className="mb-6 flex items-center gap-3">
    <div className="h-5 w-1 rounded-sm bg-orange-500/70" />
    <SkeletonBlock className="h-3 w-36" />
    <div className="h-px flex-1 bg-white/[0.06]" />
  </div>
);

const CardSkeleton = ({ children, className = "", danger = false }) => (
  <section
    className={`relative overflow-hidden rounded-2xl border p-6 ${
      danger
        ? "border-red-500/10 bg-gradient-to-b from-[#1a0f0f] to-[#0F1828]"
        : "border-white/6 bg-gradient-to-b from-[#162035] to-[#0F1828]"
    } ${className}`}
  >
    <div
      className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${
        danger
          ? "from-red-500/50 to-transparent"
          : "from-orange-500 via-amber-400 to-transparent"
      }`}
    />
    {children}
  </section>
);

export default function SettingsLoading() {
  return (
    <div
      aria-label="Loading settings"
      className="min-h-full bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans"
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/3 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/4 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[640px] px-6 py-12">
        <div className="mb-10 flex items-start gap-3">
          <SkeletonBlock className="mt-1 h-9 w-9 shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03]" />
          <div className="pt-0.5">
            <SkeletonBlock className="mb-2 h-3 w-20" />
            <SkeletonBlock className="h-9 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <CardSkeleton>
            <SectionLabelSkeleton />
            <div className="mb-6 flex items-center gap-4 border-b border-white/[0.04] pb-6">
              <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full border-2 border-white/10" />
              <div>
                <SkeletonBlock className="h-5 w-36" />
                <SkeletonBlock className="mt-2 h-4 w-16" />
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.04] py-3">
              <SkeletonBlock className="h-3 w-12" />
              <SkeletonBlock className="h-3 w-44" />
            </div>
            <div className="flex items-center justify-between py-3">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </CardSkeleton>

          <CardSkeleton>
            <SectionLabelSkeleton />
            <SkeletonBlock className="mb-2 h-7 w-16 rounded-lg" />
            <SkeletonBlock className="mb-4 h-3 w-48" />
            <SkeletonBlock className="h-10 w-full rounded-xl bg-orange-500/25" />
          </CardSkeleton>

          <CardSkeleton danger>
            <SectionLabelSkeleton />
            <div className="flex items-center justify-between gap-4">
              <div>
                <SkeletonBlock className="mb-2 h-4 w-28" />
                <SkeletonBlock className="h-3 w-64 max-w-full" />
              </div>
              <SkeletonBlock className="h-9 w-20 shrink-0 rounded-xl border border-red-500/20 bg-red-500/10" />
            </div>
          </CardSkeleton>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Loading settings
      </span>
    </div>
  );
}
