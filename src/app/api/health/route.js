export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import prisma from "../../../../prisma/prismaClient";
import { getNbaData } from "@/lib/nbaDataSource";
import { logError } from "@/lib/logger";

const isProduction = process.env.NODE_ENV === "production";
const allowsLocalNbaData = process.env.RUN_INTEGRATION_TESTS === "true";
const MAX_NBA_DATA_AGE_MS = 36 * 60 * 60 * 1000;

function publicError(message) {
  return isProduction ? "Unavailable" : message;
}

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
    health.database.error = publicError(error?.message ?? "Unknown database error");
    logError("health_database_check_failed", error);
  }

  try {
    const nbaData = await getNbaData();
    const updatedAtMs = new Date(nbaData.updatedAt ?? "").getTime();
    const isStale = Number.isFinite(updatedAtMs)
      && Date.now() - updatedAtMs > MAX_NBA_DATA_AGE_MS;
    const nbaDataHealthy = (nbaData.source === "storage" && !isStale) || allowsLocalNbaData;
    health.nbaData = {
      status: nbaDataHealthy ? "ok" : "degraded",
      source: nbaData.source,
      version: nbaData.version ?? null,
      updatedAt: nbaData.updatedAt ?? null,
      error: nbaData.error
        ? publicError(nbaData.error)
        : isStale
          ? publicError("NBA data is older than 36 hours")
          : null,
    };
    if (!nbaDataHealthy) health.status = "degraded";
  } catch (error) {
    health.status = "degraded";
    health.nbaData.status = "error";
    health.nbaData.error = publicError(error?.message ?? "Unknown NBA data error");
    logError("health_nba_data_check_failed", error);
  }

  return Response.json(health, {
    status: health.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
