import PlayerGraphSkeleton from "@/components/ui/PlayerGraph/PlayerGraphSkeleton";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-white/[0.05] ${className}`} />
);

const CardSkeleton = ({ children, className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#162035] to-[#0F1828] ${className}`}
  >
    <div className="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-orange-500 via-current/30 to-transparent opacity-80" />
    {children}
  </div>
);

const SelectionSkeleton = () => (
  <CardSkeleton className="hidden h-[calc(100dvh-80px)] min-h-0 lg:flex lg:flex-col">
    <div className="space-y-3 p-4 pb-3">
      <SkeletonBlock className="h-3 w-12" />
      <SkeletonBlock className="h-10 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-2">
        <SkeletonBlock className="h-8 rounded-lg" />
        <SkeletonBlock className="h-8 rounded-lg" />
      </div>
    </div>
    <div className="flex min-h-0 flex-1 flex-col border-t border-white/[0.07] p-4">
      <SkeletonBlock className="mb-3 h-3 w-20" />
      <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
        {["w-full", "w-11/12", "w-10/12", "w-full", "w-9/12", "w-11/12"].map((width, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl border border-white/[0.05] p-2">
            <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className={`h-2.5 ${width}`} />
              <SkeletonBlock className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </CardSkeleton>
);

const MainCardSkeleton = () => (
  <CardSkeleton className="min-h-[620px]">
    <div className="flex items-center gap-4 border-b border-white/[0.07] bg-white/[0.015] p-4">
      <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-40 max-w-full" />
        <SkeletonBlock className="h-2.5 w-28" />
      </div>
      <SkeletonBlock className="hidden h-10 w-24 rounded-lg sm:block" />
    </div>
    <PlayerGraphSkeleton />
    <SkeletonBlock className="mx-4 mb-4 h-32 rounded-xl" />
  </CardSkeleton>
);

const LowerCardSkeleton = ({ accent }) => (
  <CardSkeleton className="min-h-[220px]">
    <div className="space-y-4 p-4">
      <SkeletonBlock className={`h-3 w-32 ${accent === "blue" ? "bg-blue-400/[0.08]" : ""}`} />
      <SkeletonBlock className="h-28 w-full rounded-xl" />
    </div>
  </CardSkeleton>
);

export default function PlayerStatsLoading() {
  return (
    <div
      className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 sm:px-5 lg:px-6"
      aria-label="Loading player statistics"
    >
      <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
        <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.055] px-3 py-2.5 sm:px-4">
          <SkeletonBlock className="h-3 w-64 max-w-full bg-amber-300/[0.10]" />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
            <SelectionSkeleton />

            <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
              <div className="lg:hidden">
                <SkeletonBlock className="h-10 w-36 rounded-xl" />
              </div>
              <MainCardSkeleton />

              <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2 lg:gap-6">
                <LowerCardSkeleton accent="orange" />
                <LowerCardSkeleton accent="blue" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
