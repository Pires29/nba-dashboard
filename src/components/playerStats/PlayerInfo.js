import Image from "next/image";
import { useMemo } from "react";

const INJURY_STYLES = {
  Out: "bg-red-500/15 text-red-400 border-red-500/30",
  "Day-To-Day": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Doubtful: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Questionable: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Probable: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const PlayerInfo = ({ playerData, injuryStatus, onAddProp, propSaved }) => {
  const injuryStyle = injuryStatus
    ? INJURY_STYLES[injuryStatus] || INJURY_STYLES["Out"]
    : null;

  const displayStats = useMemo(
    () => [
      { key: "Position", value: playerData?.POSITION },
      { key: "Jersey", value: playerData?.NUM ? `#${playerData.NUM}` : "—" },
      { key: "Height", value: playerData?.HEIGHT },
      {
        key: "Weight",
        value: playerData?.WEIGHT ? `${playerData.WEIGHT} lbs` : "—",
      },
      { key: "DOB", value: playerData?.BIRTH_DATE },
    ],
    [playerData],
  );

  if (!playerData) return <PlayerInfoEmpty />;

  return (
    <div className="flex items-center gap-5 p-4">
      {/* Headshot */}
      <div className="relative flex-shrink-0">
        <div className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-[#0D1828] border border-white/6">
          <Image
            src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerData.PLAYER_ID}.png`}
            width={80}
            height={80}
            alt={playerData.PLAYER}
            fetchPriority="high"
            priority
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-black text-xl text-white tracking-tight leading-none truncate">
            {playerData.PLAYER}
          </h2>
          <span className="font-mono text-[11px] text-slate-400 uppercase tracking-widest">
            {playerData.TEAM_ABBREVIATION}
          </span>
          {injuryStyle && (
            <span
              className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-widest ${injuryStyle}`}
            >
              {injuryStatus === "Day-To-Day" ? "DTD" : injuryStatus}
            </span>
          )}

          {/* Add prop button — shown only if handler provided */}
          {onAddProp && (
            <button
              onClick={onAddProp}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-widest transition-all
                ${
                  propSaved
                    ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                    : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-300 hover:border-white/[0.14]"
                }`}
            >
              {propSaved ? (
                <>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add prop
                </>
              )}
            </button>
          )}
        </div>

        {/* Stat pills row */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {displayStats.map(({ key, value }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 bg-white/[0.04] border border-white/6 rounded-md px-2 py-1"
            >
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
                {key}
              </span>
              <span className="text-[11px] font-semibold text-slate-300 font-mono">
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlayerInfoSkeleton = () => {
  return (
    <div className="flex items-center gap-5 p-4 animate-pulse">
      <div className="w-[80px] h-[80px] rounded-xl bg-white/[0.04] border border-white/6" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-32 bg-white/[0.06] rounded" />
          <div className="h-3 w-10 bg-white/[0.04] rounded" />
        </div>
        <div className="h-3 w-12 bg-white/[0.04] rounded mb-2" />
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-white/[0.03] border border-white/6 rounded-md px-2 py-1"
            >
              <div className="h-2 w-8 bg-white/[0.05] rounded" />
              <div className="h-2 w-10 bg-white/[0.06] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlayerInfoEmpty = () => {
  return (
    <div className="flex items-center gap-5 p-4">
      <div className="w-[80px] h-[80px] rounded-xl bg-white/[0.03] border border-white/6 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-semibold text-slate-400">
            No player info available
          </p>
          <p className="text-[10px] font-mono text-slate-400 max-w-[220px]">
            We couldn&apos;t retrieve player details at this time
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 opacity-40">
          {["Position", "Jersey", "Height", "Weight", "DOB"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-white/[0.03] border border-white/6 rounded-md px-2 py-1"
            >
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
                {label}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 font-mono">
                —
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
