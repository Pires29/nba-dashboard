const STATUS_STYLES = {
  Out: "bg-red-500/15 text-red-400 border-red-500/30",
  Questionable: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Doubtful: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Probable: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      {status}
    </span>
  );
};

const Injuries = ({ injuriesTeam1, injuriesTeam2 }) => {
  const allInjuries = [
    ...(injuriesTeam1?.injuries || []),
    ...(injuriesTeam2?.injuries || []),
  ];

  if (!allInjuries.length) {
    return <p className="text-slate-600 text-xs text-center py-4">No injury reports</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {allInjuries.map((player, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors"
        >
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">
              {player.athlete.displayName}
            </p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate">
              {player.details?.type}{player.details?.detail ? ` · ${player.details.detail}` : ""}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            <StatusBadge status={player.status} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Injuries;