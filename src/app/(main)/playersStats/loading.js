import PlayerGraphSkeleton from "@/components/ui/PlayerGraph/PlayerGraphSkeleton";

export default function PlayerStatsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6" aria-label="Loading player statistics">
      <div className="hidden min-h-[620px] animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.03] lg:block" />
      <div className="min-h-[620px] rounded-2xl border border-white/[0.07] bg-[#0F1828]">
        <div className="h-28 animate-pulse border-b border-white/[0.07] bg-white/[0.03]" />
        <PlayerGraphSkeleton />
      </div>
    </div>
  );
}
