const formatInjuryLabel = (injury) => {
  if (!injury) return "";
  return injury === "Day-To-Day" ? "DTD" : injury;
};

const PlayerDropdown = ({
  combinedRoster,
  selectedName,
  injuryMap,
  onSelect,
}) => {
  const grouped = combinedRoster.reduce((groups, player) => {
    const key = player._teamLabel ?? "Team";
    if (!groups[key]) groups[key] = [];
    groups[key].push(player);
    return groups;
  }, {});

  const selectedValue =
    combinedRoster.find((player) => player.PLAYER === selectedName)?.PLAYER_ID?.toString() ??
    "";

  return (
    <label className="relative block">
      <span className="sr-only">Select player</span>
      <select
        aria-label="Select player"
        value={selectedValue}
        onChange={(event) => {
          const player = combinedRoster.find(
            (item) => String(item.PLAYER_ID) === event.target.value,
          );
          if (!player) return;
          onSelect?.(player);
        }}
        className="w-full appearance-none rounded-lg border border-white/[0.08] bg-[#060E1A] py-3 pl-3 pr-10 text-[12px] font-semibold text-slate-300 outline-none transition-colors hover:border-orange-500/30 focus:border-orange-500/40"
      >
        <option value="" disabled>
          Select player
        </option>
        {Object.entries(grouped).map(([teamLabel, players]) => (
          <optgroup key={teamLabel} label={teamLabel}>
            {players.map((player) => {
              const injury = formatInjuryLabel(injuryMap?.[player.PLAYER]);
              const number = player.NUM ? `#${player.NUM}` : "";
              const access = player._isLocked ? "🔒 Pro" : "";
              return (
                <option key={player.PLAYER_ID} value={player.PLAYER_ID}>
                  {[number, player.PLAYER, injury, access].filter(Boolean).join(" · ")}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
};

export default PlayerDropdown;
