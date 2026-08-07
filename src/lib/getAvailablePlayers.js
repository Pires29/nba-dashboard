// lib/getAvailablePlayers.js
import rostersData from "@/app/data/nba_rosters.json";
import propsData from "@/app/data/nba_props.json";
import getInjuries from "./getInjuries";
import { hasProAccess } from "./permissions";

function seededShuffle(array, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  let s = Math.abs(hash);
  const rand = () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const FREE_PLAN_LIMIT = 15;
const MIN_POINTS_AVG = 10;
const MIN_HIT_RATE_L10 = 60;
const CANDIDATE_POOL = 60;

export function getAvailablePlayers(plan) {
  if (!rostersData?.length) return new Set(); // sem dados = ninguém

  if (hasProAccess(plan)) {
    return new Set(rostersData.map((p) => p.PLAYER_ID));
  }

  // Jogadores lesionados — excluir do free
  const injuries = getInjuries();
  const injuredNames = new Set(
    injuries.flatMap(
      (team) => team?.injuries?.map((i) => i.athlete.displayName) ?? [],
    ),
  );

  // Filtra props por critérios de qualidade e ordena pelos melhores
  const qualityProps = propsData
    .filter((p) => {
      const avg = p.props?.points?.avg ?? 0;
      const l10 = p.props?.points?.L10?.hit_rate ?? 0;
      return avg >= MIN_POINTS_AVG && l10 >= MIN_HIT_RATE_L10;
    })
    .sort((a, b) => {
      // Ordena por L10 hit rate desc, desempate por média de pontos
      const aL10 = a.props?.points?.L10?.hit_rate ?? 0;
      const bL10 = b.props?.points?.L10?.hit_rate ?? 0;
      if (bL10 !== aL10) return bL10 - aL10;
      return (b.props?.points?.avg ?? 0) - (a.props?.points?.avg ?? 0);
    });

  // IDs dos top CANDIDATE_POOL jogadores com qualidade
  const topIds = new Set(
    qualityProps.slice(0, CANDIDATE_POOL).map((p) => p.player_id),
  );

  // Cruza com o roster e exclui lesionados
  const eligible = rostersData.filter(
    (p) => topIds.has(p.PLAYER_ID) && !injuredNames.has(p.PLAYER),
  );

  // Shuffle diário e devolve 15
  const seed = new Date().toISOString().split("T")[0];
  const shuffled = seededShuffle(eligible, seed);

  return new Set(shuffled.slice(0, FREE_PLAN_LIMIT).map((p) => p.PLAYER_ID));
}
