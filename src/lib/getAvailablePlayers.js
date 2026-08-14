// lib/getAvailablePlayers.js
import getProps from "./getProps";
import getInjuries from "./getInjuries";
import getRosters from "./getRosters";
import {
  hasFullPlayerAccess,
  selectFreePlayerIds,
} from "./playerEntitlements";

export function getAvailablePlayers(plan, source = {}) {
  const rostersData = source.rosters ?? getRosters();
  const propsData = source.props ?? getProps();
  if (!rostersData?.length) return new Set(); // no data means no players

  if (hasFullPlayerAccess(plan)) {
    return new Set(rostersData.map((player) => Number(player.PLAYER_ID)));
  }

  const injuries = source.injuries ?? getInjuries();
  const seed = new Date().toISOString().split("T")[0];
  return selectFreePlayerIds({
    rosters: rostersData,
    props: propsData,
    injuries,
    seed,
  });
}
