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
    <label className="block">
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
        className="w-full rounded-lg border border-white/[0.08] bg-[#060E1A] px-3 py-3 text-[12px] font-semibold text-slate-300 outline-none transition-colors hover:border-orange-500/30 focus:border-orange-500/40"
      >
        <option value="" disabled>
          Select player
        </option>
        {Object.entries(grouped).map(([teamLabel, players]) => (
          <optgroup key={teamLabel} label={teamLabel}>
            {players.map((player) => {
              const injury = formatInjuryLabel(injuryMap?.[player.PLAYER]);
              const number = player.NUM ? `#${player.NUM}` : "";
              return (
                <option key={player.PLAYER_ID} value={player.PLAYER_ID}>
                  {[number, player.PLAYER, injury].filter(Boolean).join(" · ")}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </label>
  );
};

export default PlayerDropdown;
