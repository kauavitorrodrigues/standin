import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPublicMock } = vi.hoisted(() => ({ getPublicMock: vi.fn() }));

vi.mock("@standin/core", () => ({
    HealthService: { getPublic: getPublicMock },
}));

import { getHealth } from "../getHealth";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    res.set = vi.fn(() => res);
    return res;
};

const report = (status: string) => ({
    status,
    timestamp: "2026-10-29T12:00:00.000Z",
    responseTimeMs: 3,
});

describe("getHealth controller", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("answers 200 with the report when ok", async () => {
        getPublicMock.mockResolvedValue(report("ok"));
        const res = buildRes();

        await getHealth({} as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(report("ok"));
        expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store");
    });

    it("answers 200 when degraded", async () => {
        getPublicMock.mockResolvedValue(report("degraded"));
        const res = buildRes();

        await getHealth({} as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("answers 503 when down", async () => {
        getPublicMock.mockResolvedValue(report("down"));
        const res = buildRes();

        await getHealth({} as any, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith(report("down"));
    });

    it("answers 500 without details when the service throws", async () => {
        getPublicMock.mockRejectedValue(new Error("secret detail"));
        const res = buildRes();

        await getHealth({} as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(JSON.stringify(res.json.mock.calls)).not.toContain(
            "secret detail"
        );
    });
});
