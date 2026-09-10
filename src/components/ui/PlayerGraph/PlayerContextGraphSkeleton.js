const PlayerContextGraphSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-4 border-t border-white/[0.07] bg-black/10 p-4 sm:p-5">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 animate-pulse rounded-sm bg-white/[0.08]" />
        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.05]" />
      </div>
      <div className="h-7 w-14 animate-pulse rounded border border-white/[0.06] bg-white/[0.03] lg:w-56" />
    </div>
    <div className="flex items-baseline gap-2">
      <div className="h-7 w-14 animate-pulse rounded bg-white/[0.05]" />
      <div className="h-3 w-14 animate-pulse rounded bg-white/[0.05]" />
    </div>
    <div className="max-w-[520px] space-y-2">
      <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.05]" />
    </div>
    <div className="flex h-[160px] items-end justify-around gap-2 px-4 pb-5">
      {[55, 70, 48, 62, 52, 65, 64, 82, 50, 30].map((height, index) => (
        <div key={index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3">
          <div
            className="w-3 max-w-full animate-pulse rounded-t bg-white/[0.08] sm:w-5"
            style={{ height: `${height}%` }}
          />
          <div className="h-2 w-5 max-w-full animate-pulse rounded bg-white/[0.05]" />
        </div>
      ))}
    </div>
  </div>
);

export default PlayerContextGraphSkeleton;
