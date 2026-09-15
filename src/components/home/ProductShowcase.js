"use client";

import { useEffect, useState } from "react";

const PROP_ROWS = [
  [201142, "Kevin Durant", "HOU", "DEN", "", "25.5", "Favorable", "60%", "50%", "45%", "50%", "25%"],
  [1628384, "OG Anunoby", "NYK", "UTA", "", "16.5", "Favorable", "60%", "50%", "50%", "49%", "50%"],
  [203944, "Julius Randle", "MIN", "LAC", "", "21.5", "Neutral", "60%", "40%", "35%", "43%", "25%"],
  [1629675, "Naz Reid", "MIN", "LAC", "", "13.5", "Neutral", "60%", "40%", "25%", "45%", "50%"],
  [203078, "Bradley Beal", "LAC", "MIN", "DTD", "8.5", "Neutral", "60%", "50%", "50%", "50%", "N/A"],
];

const MOBILE_PROP_ROWS = PROP_ROWS.slice(0, 3);
const CHART_BARS = [30, 20, 32, 36, 45];
const HIT_WINDOWS = [
  ["L5", "80%", "4/5"],
  ["L10", "60%", "6/10"],
  ["L20", "60%", "12/20"],
  ["L30", "53%", "16/30"],
  ["Full", "53%", "49/93"],
  ["H2H", "100%", "2/2"],
  ["Home", "53%", "24/45"],
  ["Away", "52%", "25/48"],
  ["Playoffs", "58%", "11/19"],
  ["24/25", "42%", "27/65"],
];

function DotBullet({ children }) {
  return (
    <div className="flex gap-3 border-b border-white/[0.06] pb-3 last:border-b-0">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
      <p className="text-sm leading-6 text-slate-300">{children}</p>
    </div>
  );
}

function FilterChip({ children, active = false, dropdown = true }) {
  return (
    <span className={`inline-flex min-h-8 shrink-0 items-center gap-2 rounded-lg border px-3 font-mono text-[10px] font-black ${active ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : "border-white/[0.08] bg-[#0D1828] text-slate-300"}`}>
      {children}
      {dropdown ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-current opacity-70">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

function Rate({ value }) {
  const color = value === "N/A"
    ? "text-slate-500"
    : Number(value.replace("%", "")) >= 50
      ? "text-emerald-400"
      : "text-red-400";

  return <span className={`font-mono text-sm font-black ${color}`}>{value}</span>;
}

function PropsDesktopMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,.38)]">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap">
          <div className="flex shrink-0 items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-orange-500" />
            <p className="font-mono text-base font-black uppercase tracking-[0.22em] text-white">Props</p>
            <span className="rounded-md border border-white/[0.07] px-3 py-1.5 font-mono text-xs text-slate-500">11 props</span>
          </div>
          <div className="min-h-8 w-[240px] shrink-0 rounded-lg border border-white/[0.08] bg-[#0D1828] px-4 py-2 font-mono text-xs text-slate-500">
            Search player...
          </div>
          <div className="flex flex-wrap gap-2 xl:ml-auto xl:flex-nowrap">
            <FilterChip>Points</FilterChip>
            <FilterChip active>Games (3)</FilterChip>
            <FilterChip active>HR (2 filters)</FilterChip>
            <FilterChip active>Matchup (2)</FilterChip>
            <FilterChip>Injury</FilterChip>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Active:</span>
          {["L5 HR: 50-70%", "L10 HR: 40-50%", "Matchup: Neutral, Favorable", "Game: 3 games"].map((chip) => (
            <span key={chip} className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-xs text-slate-400">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <table className="w-full table-fixed border-t border-white/[0.08] text-left">
        <thead className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
          <tr className="border-b border-white/[0.08]">
            <th className="w-[26%] px-5 py-3">Player</th>
            <th className="w-[10%] py-3">Line</th>
            <th className="w-[17%] py-3">Matchup</th>
            <th className="py-3 text-center text-orange-400">L5</th>
            <th className="py-3 text-center">L10</th>
            <th className="py-3 text-center">L20</th>
            <th className="py-3 text-center">Full</th>
            <th className="py-3 text-center">H2H</th>
          </tr>
        </thead>
        <tbody>
          {PROP_ROWS.map(([playerId, player, team, opp, injury, line, matchup, l5, l10, l20, full, h2h]) => (
            <tr key={player} className="border-b border-white/[0.055] last:border-b-0">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-9 w-9 shrink-0 rounded-lg border border-white/[0.08] bg-[#0D1828] bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png)` }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-slate-100">{player}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-slate-500"><b className="text-orange-400">{team}</b> vs {opp}</span>
                  </span>
                  {injury && <span className="rounded border border-yellow-400/35 bg-yellow-400/10 px-1.5 py-0.5 font-mono text-[9px] font-black text-yellow-300">{injury}</span>}
                </div>
              </td>
              <td className="font-mono text-sm font-black text-white">{line}</td>
              <td>
                <p className={matchup === "Favorable" ? "text-sm font-black text-emerald-400" : "text-sm font-black text-yellow-300"}>{matchup}</p>
                <p className="font-mono text-[10px] text-slate-500">#21 allowed</p>
              </td>
              {[l5, l10, l20, full, h2h].map((value, index) => (
                <td key={`${player}-${index}`} className="text-center">
                  <Rate value={value} />
                  <span className="block font-mono text-[10px] text-slate-500">{index === 0 ? "5g" : index === 1 ? "10g" : index === 2 ? "20g" : index === 3 ? "78g" : "4g"}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PropsMobileMock() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#07111f] shadow-[0_18px_60px_rgba(0,0,0,.45)]">
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-orange-500" />
          <p className="font-mono text-sm font-black uppercase tracking-[0.2em] text-white">Props</p>
          <span className="rounded border border-white/[0.07] px-2 py-1 font-mono text-[10px] text-slate-500">11 props</span>
        </div>
        <div className="mt-4 rounded-lg border border-white/[0.08] bg-[#0D1828] px-3 py-2 font-mono text-[10px] text-slate-500">Search player...</div>
        <div className="mt-3 overflow-hidden pb-1">
          <div className="flex min-w-max gap-2 border-b-2 border-slate-500/60 pb-1.5 pr-10">
          <FilterChip>Points</FilterChip>
          <FilterChip active>Games (3)</FilterChip>
          <FilterChip active>HR (2)</FilterChip>
          <FilterChip active>Matchup</FilterChip>
          <FilterChip>Injury</FilterChip>
          </div>
        </div>
      </div>
      <div className="space-y-0 border-t border-white/[0.08]">
        {MOBILE_PROP_ROWS.map(([playerId, player, team, opp, injury, line, matchup, l5, l10, l20, full, h2h]) => (
          <article key={player} className="border-b border-white/[0.06] p-4 last:border-b-0">
            <div className="flex items-start gap-3">
              <span
                className="inline-block h-9 w-9 shrink-0 rounded-lg border border-white/[0.08] bg-[#0D1828] bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png)` }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-100">{player}</p>
                <p className="font-mono text-[10px] text-slate-500"><b className="text-orange-400">{team}</b> vs {opp} · Points</p>
                <p className={matchup === "Favorable" ? "mt-2 text-xs font-black text-emerald-400" : "mt-2 text-xs font-black text-yellow-300"}>{matchup}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase text-slate-500">Line</p>
                <p className="font-mono text-sm font-black text-white">{line}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {[["L5", l5], ["L10", l10], ["L20", l20], ["Full", full], ["H2H", h2h]].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-1.5 py-2 text-center">
                  <p className="font-mono text-[8px] text-slate-500">{label}</p>
                  <Rate value={value} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PlayerStatsDesktopMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121d31] shadow-[0_24px_90px_rgba(0,0,0,.38)]">
      <PlayerHeader compact={false} />
      <div className="border-t border-white/[0.08] p-5">
        <div className="hidden gap-2 lg:flex">
          {["Points", "Assists", "Rebounds", "Blocks", "Turnovers", "Steals", "FG3M", "PRA", "PA"].map((stat, index) => (
            <span key={stat} className={`min-w-[88px] rounded-lg border px-4 py-2 text-center font-mono text-[10px] font-black uppercase tracking-widest ${index === 0 ? "border-slate-500 bg-slate-700 text-white" : "border-white/[0.08] text-slate-400"}`}>{stat}</span>
          ))}
        </div>
        <Chart />
        <div className="mt-5 flex gap-2 overflow-hidden">
          {HIT_WINDOWS.map(([label, value, record], index) => (
            <div key={label} className={`min-w-[116px] flex-1 rounded-xl border px-3 py-3 text-center ${index === 0 ? "border-orange-500/50 bg-orange-500/10" : "border-white/[0.08] bg-white/[0.025]"}`}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
              <p className={`mt-1 font-mono text-lg font-black ${value === "42%" ? "text-red-400" : "text-emerald-400"}`}>{value}</p>
              <p className="font-mono text-[10px] text-slate-500">{record}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerStatsMobileMock() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#121d31] shadow-[0_18px_60px_rgba(0,0,0,.45)]">
      <PlayerHeader compact />
      <div className="border-t border-white/[0.08] p-3">
        <div className="grid grid-cols-2 gap-3">
          <DropdownMock active>L5 · 80% · 4/5</DropdownMock>
          <DropdownMock>Points</DropdownMock>
        </div>
        <Chart compact />
      </div>
    </div>
  );
}

function DropdownMock({ children, active = false }) {
  return (
    <div className={`flex min-h-10 items-center justify-between rounded-lg border px-3 font-mono text-[10px] font-black uppercase tracking-widest ${active ? "border-orange-500/45 bg-orange-500/10 text-orange-300" : "border-white/[0.08] bg-[#0D1828] text-slate-300"}`}>
      <span className="truncate">{children}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="ml-2 h-3 w-3 shrink-0 text-slate-500">
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function PlayerHeader({ compact }) {
  return (
    <div className={compact ? "p-3" : "p-5"}>
      <div className="flex items-center gap-4">
        <span className={`${compact ? "h-14 w-14" : "h-16 w-16"} rounded-xl border border-white/[0.08] bg-[url('https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/1628973.png')] bg-cover bg-center`} />
        <div>
          <h3 className={`${compact ? "text-xl" : "text-2xl"} font-black text-white`}>Jalen Brunson</h3>
          <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-slate-400">G | NYK</p>
          <span className="mt-2 inline-flex rounded-md border border-yellow-400/35 bg-yellow-400/10 px-2 py-1 font-mono text-[10px] font-black text-yellow-300">DTD</span>
        </div>
      </div>
      <div className={`${compact ? "mt-3 gap-2 px-3 py-2.5" : "mt-4 gap-4 px-4 py-3"} flex items-center rounded-xl border border-white/[0.08] bg-white/[0.025]`}>
        {["26.5 Points", "80% Hit Rate", "5 Games"].map((item) => {
          const [value, ...label] = item.split(" ");
          return (
            <div key={item} className={`${compact ? "gap-1 pr-2" : "gap-1.5 pr-4"} flex items-baseline border-r border-white/[0.08] last:border-r-0 last:pr-0`}>
              <span className={`font-mono ${compact ? "text-lg" : "text-2xl"} font-black ${value === "80%" ? "text-emerald-400" : "text-white"}`}>{value}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label.join(" ")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chart({ compact = false }) {
  const ticks = compact ? ["50", "40", "30", "20", "10", "0"] : ["60", "50", "40", "30", "20", "10"];
  const maxValue = compact ? 50 : 60;
  const plotHeight = compact ? 150 : 210;

  return (
    <div className={`${compact ? "mt-5 pl-8 pr-2" : "mt-8 pl-10 pr-4"} relative`}>
      <div className={`${compact ? "h-[150px]" : "h-[210px]"} relative border-b border-white/[0.08]`}>
        <div className={`absolute left-[-24px] top-0 flex h-full flex-col justify-between font-mono text-xs text-slate-500 ${compact ? "text-[10px]" : ""}`}>
          {ticks.map((tick) => (
            <p key={tick}>{tick}</p>
          ))}
        </div>
        <div className="flex h-full items-end justify-around gap-3">
          {CHART_BARS.map((value, index) => (
            <div key={index} className="flex flex-1 justify-center">
              <div
                className={`${compact ? "w-10" : "w-12"} rounded-t-md ${index === 1 ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ height: `${(value / maxValue) * plotHeight}px` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-1 mt-2 flex justify-around gap-3">
        {CHART_BARS.map((_, index) => (
          <p key={index} className="flex-1 text-center font-mono text-[10px] font-bold leading-4 text-slate-400">
            SAS<br />0{index + 3}/06
          </p>
        ))}
      </div>
      <div className={`absolute rounded-xl border border-white/[0.09] bg-[#07111f] shadow-xl ${compact ? "right-[15%] top-[38%] px-3 py-2" : "right-[12%] top-[32%] px-4 py-3"}`}>
        <p className={`${compact ? "text-xs" : "text-sm"} font-black text-white`}>Points: <span className="text-orange-400">45</span></p>
        <p className={`${compact ? "mt-0.5 text-[10px] leading-4" : "mt-1 text-xs leading-5"} text-slate-400`}>2026-06-13<br />vs SAS<br />Away</p>
      </div>
    </div>
  );
}

function ShowcaseBlock({ type, eyebrow, title, body, points, reverse = false }) {
  // Render the compact visual during SSR. On phones it remains the only visual,
  // avoiding the hidden desktop DOM; desktop upgrades after hydration.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateLayout = () => setIsDesktop(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  const mobileWidth = type === "player"
    ? "w-[52%] min-w-[330px] max-w-[470px]"
    : "w-[40%] min-w-[220px] max-w-[335px]";
  const mobilePosition = type === "props"
    ? "right-3 lg:right-4 xl:-right-5 lg:-bottom-10"
    : "right-2 lg:right-4 xl:-right-4";
  const visual = (
    <div className="min-w-0">
      {isDesktop ? (
        <div className={`relative pb-16 ${type === "player" ? "ml-auto max-w-[760px] pb-36" : "pb-20"}`}>
          {type === "props" ? <PropsDesktopMock /> : <PlayerStatsDesktopMock />}
          <div className={`absolute -bottom-2 ${mobileWidth} ${mobilePosition}`}>
            {type === "props" ? <PropsMobileMock /> : <PlayerStatsMobileMock />}
          </div>
        </div>
      ) : (
        <div className="mx-auto block w-full max-w-[470px]">
          {type === "props" ? <PropsMobileMock /> : <PlayerStatsMobileMock />}
        </div>
      )}
    </div>
  );

  const copy = (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">{eyebrow}</p>
      <h2 className={`mt-4 font-black tracking-tight text-white ${reverse ? "text-4xl sm:text-[44px]" : "text-4xl sm:text-5xl"}`}>{title}</h2>
      <p className="mt-5 text-base leading-7 text-slate-400">{body}</p>
      <div className="mt-8 space-y-3">
        {points.map((point) => <DotBullet key={point}>{point}</DotBullet>)}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col gap-8 lg:grid lg:items-center lg:gap-20 xl:gap-24 ${reverse ? "lg:grid-cols-[minmax(460px,0.95fr)_minmax(0,0.85fr)]" : "lg:grid-cols-[1.2fr_0.8fr]"}`}>
      <div className={`min-w-0 order-2 ${reverse ? "lg:order-2" : "lg:order-1"}`}>{visual}</div>
      <div className={`min-w-0 order-1 ${reverse ? "max-w-3xl lg:order-1" : "lg:pl-2 xl:pl-4 lg:order-2"}`}>{copy}</div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#07101b] py-24">
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="space-y-24">
          <ShowcaseBlock
            type="props"
            eyebrow="Props table"
            title="Filter the slate before you spend time on a line."
            body="Start with the full board, then narrow it by player, market, game, hit-rate window, matchup quality, and injury status."
            points={[
              "Search players quickly when you already have a name in mind.",
              "Filter by game, market, matchup, injury status, and hit-rate ranges.",
              "Sort L5, L10, L20, season, or H2H to find props worth deeper review.",
            ]}
          />
          <ShowcaseBlock
            type="player"
            eyebrow="Player stats"
            title="Open the player page when the shortlist needs context."
            body="Once a prop looks interesting, inspect the player view for recent logs, hit-rate windows, matchup details, injuries, and teammate impact."
            points={[
              "Compare recent production against the current line.",
              "Check L5, L10, full-season, home/away, playoffs, and H2H hit rates.",
              "Review matchup and availability context before making a decision.",
            ]}
            reverse
          />
        </div>
      </div>
    </section>
  );
}
