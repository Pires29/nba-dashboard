export const PLANS = {
  free: {
    rosterMaxPlayers: 5,
    graphMaxGames: 5,
    teamStats: false,
  },
  pro: {
    rosterMaxPlayers: Infinity,
    graphMaxGames: Infinity,
    teamStats: true,
  },
};

export function getPlan(plan) {
  return PLANS[plan] ?? PLANS["free"];
}

export function isLimited(plan) {
  return !plan || plan === "free";
}

export function hasProAccess(plan) {
  return plan === "pro" || plan === "trial";
}
