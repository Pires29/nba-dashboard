import GameDropdown from "../selectors/GameDropdown";
import PlayerDropdown from "../selectors/PlayerDropdown";

const MobileSheet = ({
  combinedRoster,
  selectedName,
  injuryMap,

  plan,
  team1Id,
  team2Id,
  gamesList,
  teamNameMap,

  sheetOpen,
  handleSelectPlayer,
  handleGameSelect,
  setSheetOpen,
  minuteSliderMax = 48,
  rangeMinMinutes,
  rangeMaxMinutes,
  setRangeMinMinutes,
  setRangeMaxMinutes,
  hasMinuteFilter,
  resetMinuteFilter,
  onApplyFilters,
  teammateImpact = [],
  maxTeammates = 3,
  selectedTeammateIds = [],
  teammateModes = {},
  onSetTeammateRule,
  onResetTeammates,
}) => {
  const minuteTrackBackground = `linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) ${(rangeMinMinutes / minuteSliderMax) * 100}%, #f97316 ${(rangeMinMinutes / minuteSliderMax) * 100}%, #f97316 ${(rangeMaxMinutes / minuteSliderMax) * 100}%, rgba(255,255,255,0.08) ${(rangeMaxMinutes / minuteSliderMax) * 100}%, rgba(255,255,255,0.08) 100%)`;
  const selectedTeammateCount = Object.keys(teammateModes).length;

  return (
    <>
      {sheetOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col rounded-t-2xl border-t border-white/[0.08] bg-[#0D1828] shadow-[0_-8px_40px_rgba(0,0,0,0.7)]">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-2">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Filters
                </span>

                <button
                  aria-label="Close filters"
                  onClick={() => setSheetOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* PLAYER DROPDOWN */}
              <div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                  Player
                </p>

                <PlayerDropdown
                  combinedRoster={combinedRoster}
                  selectedName={selectedName}
                  injuryMap={injuryMap}
                  onSelect={handleSelectPlayer}
                />
              </div>

              {/* GAME DROPDOWN */}
              <div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                  Game
                </p>

                <GameDropdown
                  plan={plan}
                  team1Id={team1Id}
                  team2Id={team2Id}
                  games={gamesList}
                  teams={teamNameMap}
                  onSelect={handleGameSelect}
                />
              </div>

              {/* MINUTES RANGE */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    Minutes range
                  </p>
                  {hasMinuteFilter && (
                    <button
                      type="button"
                      onClick={resetMinuteFilter}
                      className="font-mono text-[8px] font-bold uppercase tracking-wider text-slate-500 hover:text-orange-200"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="mt-4 flex justify-between font-mono text-[11px] font-black text-white">
                  <span>{rangeMinMinutes} min</span>
                  <span>{rangeMaxMinutes} min</span>
                </div>

                <div className="mt-4 px-1">
                  <div
                    className="relative h-2 rounded-full"
                    style={{ background: minuteTrackBackground }}
                  >
                    <input
                      type="range"
                      min="0"
                      max={minuteSliderMax}
                      value={rangeMinMinutes}
                      onChange={(event) =>
                        setRangeMinMinutes(
                          Math.min(Number(event.target.value), rangeMaxMinutes),
                        )
                      }
                      aria-label="Minimum minutes"
                      className="pointer-events-none absolute -top-[5px] left-0 z-20 h-3 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-300 [&::-moz-range-thumb]:bg-[#0D1828] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-300 [&::-webkit-slider-thumb]:bg-[#0D1828]"
                    />
                    <input
                      type="range"
                      min="0"
                      max={minuteSliderMax}
                      value={rangeMaxMinutes}
                      onChange={(event) =>
                        setRangeMaxMinutes(
                          Math.max(Number(event.target.value), rangeMinMinutes),
                        )
                      }
                      aria-label="Maximum minutes"
                      className="pointer-events-none absolute -top-[5px] left-0 z-10 h-3 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-300 [&::-moz-range-thumb]:bg-[#0D1828] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-300 [&::-webkit-slider-thumb]:bg-[#0D1828]"
                    />
                  </div>
                  <div className="mt-3 flex justify-between font-mono text-[8px] text-slate-500">
                    <span>0</span>
                    <span>12</span>
                    <span>24</span>
                    <span>36</span>
                    <span>{minuteSliderMax}</span>
                  </div>
                </div>
              </div>

              {/* TEAMMATES */}
              {teammateImpact.length > 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                        Teammates
                      </p>
                      <p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-slate-500">
                        {selectedTeammateCount}/{maxTeammates} selected
                      </p>
                    </div>
                    {selectedTeammateCount > 0 && (
                      <button
                        type="button"
                        onClick={onResetTeammates}
                        className="font-mono text-[8px] font-bold uppercase tracking-wider text-slate-500 hover:text-orange-200"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-white/[0.06]">
                    {teammateImpact.map((entry) => {
                      const playerId = String(entry.playerId);
                      const selectedMode = teammateModes[playerId];
                      const atLimit =
                        !selectedTeammateIds.includes(playerId) &&
                        selectedTeammateCount >= maxTeammates;
                      return (
                        <div
                          key={entry.playerId}
                          className={`grid grid-cols-[34px_34px_minmax(0,1fr)_50px_50px] items-center gap-2 border-b border-white/[0.05] px-2.5 py-2 last:border-b-0 ${atLimit ? "opacity-40" : ""}`}
                        >
                          {[
                            { mode: "WITH", label: "+" },
                            { mode: "WITHOUT", label: "−" },
                          ].map((option) => (
                            <button
                              key={option.mode}
                              type="button"
                              disabled={atLimit}
                              onClick={() => onSetTeammateRule?.(entry, option.mode)}
                              aria-label={`${option.mode === "WITH" ? "With" : "Without"} ${entry.playerName}`}
                              className={`flex h-8 w-8 items-center justify-center rounded-md border font-mono text-base disabled:cursor-not-allowed ${
                                selectedMode === option.mode
                                  ? "border-orange-400/50 bg-orange-500/15 text-orange-200"
                                  : "border-white/[0.1] text-slate-500"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                          <span className="truncate text-[11px] font-semibold text-slate-100">
                            {entry.playerName}
                          </span>
                          <span className="text-right font-mono text-[9px] text-slate-400">
                            {entry.avgMinutes ?? "—"} min
                          </span>
                          <span className="text-right font-mono text-[9px] text-slate-400">
                            {entry.avgPoints ?? "—"} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            <div className="border-t border-white/[0.08] bg-[#0D1828]/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-[0_-12px_24px_rgba(6,14,26,0.85)]">
              <button
                type="button"
                onClick={onApplyFilters}
                className="w-full rounded-xl bg-orange-500 px-4 py-3 font-mono text-[10px] font-black uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(249,115,22,0.28)] transition-colors hover:bg-orange-400"
              >
                Apply filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileSheet;
