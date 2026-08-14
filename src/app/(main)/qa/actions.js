"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createQaToken,
  isQaEnabled,
  QA_COOKIE,
  QA_PERSONAS,
  QA_SCENARIOS,
} from "@/lib/qa/context";

export async function activateQaScenario(formData) {
  if (!isQaEnabled()) redirect("/");
  const persona = String(formData.get("persona") ?? "");
  const scenario = String(formData.get("scenario") ?? "");
  if (!QA_PERSONAS.includes(persona) || !QA_SCENARIOS.includes(scenario)) {
    redirect("/qa?error=invalid");
  }

  const store = await cookies();
  store.set(QA_COOKIE, createQaToken({ persona, scenario }), {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/qa");
}

export async function clearQaScenario() {
  const store = await cookies();
  store.delete(QA_COOKIE);
  redirect("/qa");
}
