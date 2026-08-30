export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import prisma from "../../../../prisma/prismaClient";
import { getNbaData } from "@/lib/nbaDataSource";
import { logError } from "@/lib/logger";

export async function GET() {
  const health = {
    status: "ok",
    database: { status: "unknown", error: null },
    nbaData: {
      status: "unknown",
      source: null,
      version: null,
      updatedAt: null,
      error: null,
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database.status = "ok";
  } catch (error) {
    health.status = "degraded";
    health.database.status = "error";
    health.database.error = error?.message ?? "Unknown database error";
    logError("health_database_check_failed", error);
  }

  try {
    const nbaData = await getNbaData();
    health.nbaData = {
      status: nbaData.source === "storage" ? "ok" : "degraded",
      source: nbaData.source,
      version: nbaData.version ?? null,
      updatedAt: nbaData.updatedAt ?? null,
      error: nbaData.error ?? null,
    };
    if (nbaData.source !== "storage") health.status = "degraded";
  } catch (error) {
    health.status = "degraded";
    health.nbaData.status = "error";
    health.nbaData.error = error?.message ?? "Unknown NBA data error";
    logError("health_nba_data_check_failed", error);
  }

  return Response.json(health, {
    status: health.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
