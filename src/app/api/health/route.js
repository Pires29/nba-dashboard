export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import prisma from "../../../../prisma/prismaClient";
import { getNbaData } from "@/lib/nbaDataSource";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const nbaData = await getNbaData();

    return Response.json(
      {
        status: "ok",
        database: "ok",
        nbaData: {
          source: nbaData.source,
          version: nbaData.version ?? null,
          updatedAt: nbaData.updatedAt ?? null,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logError("health_check_failed", error);
    return Response.json(
      { status: "degraded" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
