import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connection: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock("next/server", () => ({
  connection: mocks.connection,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
  },
}));

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  beforeEach(() => {
    mocks.connection.mockResolvedValue(undefined);
    mocks.queryRaw.mockResolvedValue([{ value: 1 }]);
  });

  it("reports a healthy database connection", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      database: "connected",
    });
  });
});
