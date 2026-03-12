const PlayerInfo = ({ playerData, playerInfo }) => {
  if (!playerData) return null;

  const displayStats = [
    { key: "Position", value: playerData.POSITION },
    { key: "Jersey", value: `#${playerData.NUM}` },
    { key: "Height", value: playerData.HEIGHT },
    { key: "Weight", value: playerData.WEIGHT ? `${playerData.WEIGHT} lbs` : "—" },
    { key: "DOB", value: playerData.BIRTH_DATE },
  ];

  return (
    <div className="flex items-center gap-5 p-4">
      {/* Headshot */}
      <div className="relative flex-shrink-0">
        <div className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-[#0D1828] border border-white/[0.06]">
          <img
            src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerData.PLAYER_ID}.png`}
            width={80}
            height={80}
            alt={playerData.PLAYER}
            className="object-cover w-full h-full"
            onError={(e) => { e.target.style.opacity = 0.2; }}
          />
        </div>
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h2 className="font-black text-xl text-white tracking-tight leading-none truncate">
            {playerData.PLAYER}
          </h2>
          <span className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
            {playerData.TEAM_ABBREVIATION}
          </span>
        </div>

        {/* Stat pills row */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {displayStats.map(({ key, value }) => (
            <div key={key} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1">
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">{key}</span>
              <span className="text-[11px] font-semibold text-slate-300 font-mono">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;