import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getQaContext,
  isQaRequestAllowed,
  QA_PERSONAS,
  QA_SCENARIOS,
} from "@/lib/qa/context";
import { activateQaScenario, clearQaScenario } from "./actions";
import { getAvailablePlayers } from "@/lib/getAvailablePlayers";

export const metadata = { title: "QA Console", robots: { index: false, follow: false } };

const label = (value) => value.replaceAll("-", " ");

export default async function QaPage() {
  if (!(await isQaRequestAllowed())) notFound();
  const qa = await getQaContext();
  const firstGame = qa?.data.games[0];
  const availableIds = qa ? getAvailablePlayers(qa.persona, qa.data) : new Set();
  const gameRoster = qa?.data.rosters.filter(
    (player) => firstGame && [firstGame.home_team_id, firstGame.visitor_team_id].includes(player.TEAM_ID),
  ) ?? [];
  const unlockedPlayer = gameRoster.find((player) => availableIds.has(player.PLAYER_ID));
  const lockedPlayer = gameRoster.find((player) => !availableIds.has(player.PLAYER_ID));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <div className="rounded-2xl border border-orange-500/20 bg-[#0D1828] p-6 sm:p-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Local QA console</p>
        <h1 className="mt-2 text-3xl font-black text-white">Test the product with controlled data</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Select a persona and dataset. The choice applies to Server Components and protected player APIs without changing your database account.
        </p>

        <form action={activateQaScenario} className="mt-8 grid gap-4 rounded-xl border border-white/[0.07] bg-[#060E1A]/60 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-bold text-slate-300">
            Persona
            <select name="persona" defaultValue={qa?.persona ?? "free"} className="mt-2 block w-full rounded-lg border border-white/10 bg-[#0D1828] px-3 py-3 text-sm text-white">
              {QA_PERSONAS.map((persona) => <option key={persona} value={persona}>{label(persona)}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-300">
            Dataset
            <select name="scenario" defaultValue={qa?.scenario ?? "regular"} className="mt-2 block w-full rounded-lg border border-white/10 bg-[#0D1828] px-3 py-3 text-sm text-white">
              {QA_SCENARIOS.map((scenario) => <option key={scenario} value={scenario}>{label(scenario)}</option>)}
            </select>
          </label>
          <button className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-400">Activate</button>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase ${qa ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/10 text-slate-500"}`}>
            {qa ? `${qa.persona} · ${qa.scenario}` : "QA inactive"}
          </span>
          {qa && <form action={clearQaScenario}><button className="text-xs font-bold text-slate-400 hover:text-white">Return to real data</button></form>}
        </div>

        {qa && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/props" className="rounded-xl border border-white/[0.08] p-5 text-white hover:border-orange-500/40"><strong>Props table</strong><span className="mt-2 block text-xs text-slate-400">{qa.data.props.length} players · {qa.data.games.length} games</span></Link>
            {firstGame && unlockedPlayer && <Link href={`/playersStats?team1Id=${firstGame.home_team_id}&team2Id=${firstGame.visitor_team_id}&playerId=${unlockedPlayer.PLAYER_ID}`} className="rounded-xl border border-emerald-500/20 p-5 text-white hover:border-emerald-500/50"><strong>Unlocked player</strong><span className="mt-2 block text-xs text-slate-400">Open a player available to this persona</span></Link>}
            {firstGame && lockedPlayer && <Link href={`/playersStats?team1Id=${firstGame.home_team_id}&team2Id=${firstGame.visitor_team_id}&playerId=${lockedPlayer.PLAYER_ID}`} className="rounded-xl border border-orange-500/20 p-5 text-white hover:border-orange-500/50"><strong>Locked player</strong><span className="mt-2 block text-xs text-slate-400">Validate the Free upgrade flow</span></Link>}
            <Link href="/pricing" className="rounded-xl border border-white/[0.08] p-5 text-white hover:border-orange-500/40"><strong>Pricing</strong><span className="mt-2 block text-xs text-slate-400">Check plan messaging and upgrade paths</span></Link>
          </section>
        )}
      </div>
    </main>
  );
}
