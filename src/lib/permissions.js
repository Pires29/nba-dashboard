import { hasFullPlayerAccess } from "./playerEntitlements";

export function hasProAccess(plan) {
  return hasFullPlayerAccess(plan);
}
