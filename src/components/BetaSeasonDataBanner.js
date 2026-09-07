const formatSnapshotDate = (updatedAt) => {
  if (!updatedAt) return null;

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const BetaSeasonDataBanner = ({ updatedAt }) => {
  const snapshotDate = formatSnapshotDate(updatedAt);

  return (
    <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.055] px-3 py-2.5 shadow-sm shadow-black/10 sm:px-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-300">
          Beta · Previous season data
        </span>
        <span className="hidden h-1 w-1 rounded-full bg-amber-300/40 sm:block" />
        <p className="text-[11px] leading-5 text-slate-300 sm:text-xs">
          You&apos;re exploring the 2025–26 NBA season. These stats are historical
          {snapshotDate ? ` as of ${snapshotDate}` : ""} and do not reflect current matchups.
        </p>
      </div>
    </div>
  );
};

export default BetaSeasonDataBanner;
