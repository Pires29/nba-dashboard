"use client";

import UpgradeOverlay from "@/components/UpgradeOverlay";

const PlayerRow = ({ player, isSelected, onClick, clickable = true }) => (
  <div
    onClick={onClick}
    className={`
      group flex items-center justify-between px-4 py-2.5
      border-b border-white/[0.04] transition-all duration-150
      ${clickable ? "cursor-pointer" : ""}
      ${
        isSelected
          ? "bg-white/[0.07] border-l-2 border-l-slate-400"
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
        rounded border text-center leading-none
        ${
          isSelected
            ? "border-slate-400 text-slate-300 bg-slate-700/40"
            : "border-white/10 text-slate-600 group-hover:text-slate-400"
        }
      `}
      >
        {player.NUM}
      </span>
      <div>
        <p
          className={`text-[13px] font-semibold leading-tight tracking-tight ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}
        >
          {player.PLAYER}
        </p>
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mt-0.5">
          {player.POSITION}
        </p>
      </div>
    </div>
    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
  </div>
);

const TeamRoster = ({ teamRoster, setSelectedName, selectedName, plan }) => {
  const maxPlayers = plan === "pro" ? Infinity : 5;
  const visiblePlayers = teamRoster.slice(0, maxPlayers);
  const blockedPlayers = teamRoster.slice(maxPlayers);
  const isLimited = blockedPlayers.length > 0;

  if (!isLimited) {
    return (
      <div className="mt-1 overflow-y-auto scrollbar-thin">
        {visiblePlayers.map((player, index) => (
          <PlayerRow
            key={index}
            player={player}
            isSelected={player.PLAYER === selectedName}
            onClick={() => setSelectedName(player.PLAYER)}
            clickable
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-1 flex flex-col">
      {/* Jogadores visíveis e clicáveis */}
      {visiblePlayers.map((player, index) => (
        <PlayerRow
          key={index}
          player={player}
          isSelected={player.PLAYER === selectedName}
          onClick={() => setSelectedName(player.PLAYER)}
          clickable
        />
      ))}

      {/* Todos os jogadores bloqueados — desfocados com overlay centrado */}
      <div className="relative pt-5">
        {/* Lista desfocada */}
        <div className="blur-sm pointer-events-none select-none opacity-60">
          {blockedPlayers.map((player, index) => (
            <PlayerRow
              key={index}
              player={player}
              isSelected={false}
              clickable={false}
            />
          ))}
        </div>

        {/* Overlay centrado sobre os jogadores bloqueados */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative rounded-xl border border-orange-500/30 bg-[#0D1828]/90 backdrop-blur-sm p-5 text-center shadow-[0_0_40px_rgba(249,115,22,0.15)] w-[200px]">
            <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <path
                  d="M7 11V7a5 5 0 0110 0v4"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 mb-1">
              Pro Plan
            </p>
            <p className="text-[11px] font-mono text-slate-400 mb-3 leading-snug">
              +{blockedPlayers.length} jogadores disponíveis no Pro
            </p>
            <a
              href="/pricing"
              className="block w-full py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)]"
            >
              Upgrade →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamRoster;
