import { beforeEach, describe, expect, it, vi } from "vitest";

const { pingMock } = vi.hoisted(() => ({ pingMock: vi.fn() }));

vi.mock("../../repository", () => ({ HealthRepository: { ping: pingMock } }));

import { getPublicHealth } from "../getPublic";

beforeEach(() => {
    vi.resetAllMocks();
});

describe("getPublicHealth", () => {
    it("reports ok with a timestamp and the response time", async () => {
        pingMock.mockResolvedValue(undefined);

        const report = await getPublicHealth();

        expect(report.status).toBe("ok");
        expect(new Date(report.timestamp).toISOString()).toBe(report.timestamp);
        expect(report.responseTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("reports down when the database fails", async () => {
        pingMock.mockRejectedValue(new Error("db down"));

        const report = await getPublicHealth();

        expect(report.status).toBe("down");
    });

    it("carries nothing about the failure", async () => {
        pingMock.mockRejectedValue(new Error("password=secret host=db"));

        const report = await getPublicHealth();

        expect(Object.keys(report).sort()).toEqual([
            "responseTimeMs",
            "status",
            "timestamp",
        ]);
    });
});
