// lib/getAvailablePlayers.js
import getProps from "./getProps";
import getInjuries from "./getInjuries";
import getRosters from "./getRosters";
import {
  hasFullPlayerAccess,
  selectFreePlayerIds,
} from "./playerEntitlements";

export function getAvailablePlayers(plan) {
  const rostersData = getRosters();
  const propsData = getProps();
  if (!rostersData?.length) return new Set(); // no data means no players

  if (hasFullPlayerAccess(plan)) {
    return new Set(rostersData.map((player) => Number(player.PLAYER_ID)));
  }

  const injuries = getInjuries();
  const seed = new Date().toISOString().split("T")[0];
  return selectFreePlayerIds({
    rosters: rostersData,
    props: propsData,
    injuries,
    seed,
  });
}
