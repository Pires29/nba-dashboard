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
}) => {
  return (
    <>
      {sheetOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-white/[0.08] bg-[#0D1828] shadow-[0_-8px_40px_rgba(0,0,0,0.7)]">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            <div className="px-5 pb-6 pt-2 flex flex-col gap-5 max-h-[80vh]">
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
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileSheet;
