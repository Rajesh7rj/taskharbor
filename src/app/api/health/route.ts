import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await connection();
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "ok",
      database: "connected",
    });
  } catch {
    return Response.json(
      { status: "error", database: "unavailable" },
      { status: 503 },
    );
  }
}
