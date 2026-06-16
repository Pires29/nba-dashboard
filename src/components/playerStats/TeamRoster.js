"use client";

import { useMemo } from "react";

const INJURY_STYLES = {
  Out: "bg-red-500/15 text-red-400 border-red-500/30",
  "Day-To-Day": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Doubtful: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Questionable: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Probable: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const PlayerRow = ({
  player,
  isSelected,
  onClick,
  clickable = true,
  injuryStatus,
}) => (
  <div
    onClick={onClick}
    className={`
      group flex items-center justify-between px-4 py-2.5
      border-b border-white/[0.04] transition-all duration-150
      ${clickable ? "cursor-pointer" : ""}
      ${
        isSelected
          ? " border-l-2 border-l-slate-400"
          : clickable
            ? "hover:bg-white/[0.04] border-l-2 border-l-transparent"
            : "border-l-2 border-l-transparent"
      }
    `}
  >
    <div className="flex items-center gap-3">
      <span
        className={`
        font-mono text-[10px] w-6 h-6 flex items-center justify-center
        rounded border text-center leading-none border-white/10 text-slate-400 group-hover:text-slate-300
        
      `}
      >
        {player.NUM}
      </span>
      <div>
        <p
          className={`text-[13px] font-semibold leading-tight tracking-tight text-slate-300 group-hover:text-white`}
        >
          {player.PLAYER}
        </p>
        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
          {player.POSITION}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {injuryStatus && (
        <span
          className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-widest ${INJURY_STYLES[injuryStatus] || "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}
        >
          {injuryStatus === "Day-To-Day" ? "DTD" : injuryStatus}
        </span>
      )}
      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
    </div>
  </div>
);

const TeamRoster = ({
  teamRoster = [],
  setSelectedName,
  selectedName,
  injuryMap,
}) => {
  const sortedRoster = useMemo(() => {
    const safeRoster = Array.isArray(teamRoster) ? teamRoster : [];
    return [...safeRoster].sort((a, b) => {
      if (!a.NUM) return 1;
      if (!b.NUM) return -1;
      return parseInt(a.NUM) - parseInt(b.NUM);
    });
  }, [teamRoster]);

  return (
    <div className="mt-1 overflow-y-auto scrollbar-thin">
      {sortedRoster.map((player, index) => (
        <PlayerRow
          key={index}
          player={player}
          isSelected={player.PLAYER === selectedName}
          onClick={() => setSelectedName(player)}
          clickable
          injuryStatus={injuryMap?.[player.PLAYER]}
        />
      ))}
    </div>
  );
};

export default TeamRoster;
