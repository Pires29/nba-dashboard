import PlayerContextGraphSkeleton from "@/components/ui/PlayerGraph/PlayerContextGraphSkeleton";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-white/[0.05] ${className}`} />
);

const CardSkeleton = ({ children, className = "", accent = "orange" }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#162035] to-[#0F1828] ${className}`}
  >
    <div className={`absolute left-4 right-4 top-0 h-px bg-gradient-to-r ${accent === "blue" ? "from-blue-500" : "from-orange-500"} via-current/30 to-transparent opacity-80`} />
    {children}
  </div>
);

const SelectionSkeleton = () => (
  <CardSkeleton className="hidden h-full min-h-0 lg:flex lg:flex-col">
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
  <CardSkeleton className="shrink-0">
    <div className="space-y-2 border-b border-white/[0.07] bg-white/[0.015] p-4">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-9 w-9 shrink-0 rounded-lg" />
        <SkeletonBlock className="h-16 w-16 shrink-0 rounded-xl md:h-20 md:w-20" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-6 w-48 max-w-full" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
        <SkeletonBlock className="hidden h-3 w-40 sm:block" />
      </div>
      <SkeletonBlock className="h-[60px] w-full rounded-xl" />
    </div>
    <div className="space-y-6 p-4 sm:p-5">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 9 }, (_, index) => (
          <SkeletonBlock key={index} className="h-8 min-w-20 flex-1 rounded-lg" />
        ))}
      </div>
      <SkeletonBlock className="h-[300px] w-full rounded-xl lg:h-[360px]" />
      <div className="grid grid-cols-5 gap-2 lg:grid-cols-10">
        {Array.from({ length: 10 }, (_, index) => (
          <SkeletonBlock key={index} className="h-[70px] rounded-lg" />
        ))}
      </div>
    </div>
    <PlayerContextGraphSkeleton />
  </CardSkeleton>
);

const MatchupContextSkeleton = () => (
  <CardSkeleton accent="blue" className="shrink-0">
    <div className="space-y-5 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-4 w-36" />
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <SkeletonBlock className="h-5 w-48 max-w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-white/[0.06] bg-[#060E1A]/60 p-3 sm:p-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-7 w-16" />
            <SkeletonBlock className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-40" />
        <div className="overflow-hidden rounded-xl border border-white/[0.10]">
          {Array.from({ length: 5 }, (_, row) => (
            <div key={row} className="grid grid-cols-4 gap-4 border-b border-white/[0.06] p-3 last:border-b-0">
              {Array.from({ length: 4 }, (_, column) => (
                <SkeletonBlock key={column} className="h-4 w-full max-w-20" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock key={index} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  </CardSkeleton>
);

export default function PlayerStatsLoading() {
  return (
    <div
      className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:h-full lg:min-h-0 lg:flex-none px-4 sm:px-5 lg:px-6"
      aria-label="Loading player statistics"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 py-4 lg:gap-6 lg:pt-6">
        <div className="shrink-0 rounded-lg border border-amber-400/15 bg-amber-400/[0.055] px-3 py-2.5 sm:px-4">
          <SkeletonBlock className="h-5 w-64 max-w-full bg-amber-300/[0.10]" />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:gap-6">
          <div className="grid min-h-0 min-w-0 flex-1 items-stretch gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-6">
            <SelectionSkeleton />

            <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
              <div className="lg:hidden">
                <SkeletonBlock className="h-10 w-36 rounded-xl" />
              </div>
              <MainCardSkeleton />
              <MatchupContextSkeleton />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
