const PlayerContextGraphSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-4 border-t border-white/[0.07] bg-black/10 p-4 sm:p-5">
    <div className="flex items-center justify-between gap-4">
      <div className="h-4 w-20 animate-pulse rounded bg-white/[0.05]" />
      <div className="h-7 w-20 animate-pulse rounded-lg bg-white/[0.05] lg:w-56" />
    </div>
    <div className="flex items-baseline gap-2">
      <div className="h-7 w-8 animate-pulse rounded bg-white/[0.05]" />
      <div className="h-3 w-14 animate-pulse rounded bg-white/[0.05]" />
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
