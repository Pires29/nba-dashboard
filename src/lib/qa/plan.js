export function resolveQaPlan(persona, accountPlan = "free") {
  if (!persona || persona === "account") return accountPlan || "free";
  return persona;
}
