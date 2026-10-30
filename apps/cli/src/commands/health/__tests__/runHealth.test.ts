import { describe, expect, it, vi } from "vitest";
import { InstanceDownError } from "../../../errors/InstanceDownError";
import { createFakeRuntime } from "../../../testing/createFakeRuntime";
import { runHealth } from "../runHealth";

const run = (status: "ok" | "degraded" | "down") => {
    const report = {
        status,
        timestamp: "2026-01-01T00:00:00.000Z",
        responseTimeMs: 12,
    };
    const { runtime } = createFakeRuntime({
        services: { getHealth: vi.fn(async () => report) },
    });
    return { report, promise: runHealth({ args: {}, ...runtime }) };
};

describe("runHealth", () => {
    it("reports an ok instance", async () => {
        const { report, promise } = run("ok");
        const output = await promise;
        expect(output.result).toEqual(report);
        expect(output.lines).toEqual(["✓ instance is ok (checked in 12 ms)"]);
    });

    it("reports a degraded instance without failing", async () => {
        const output = await run("degraded").promise;
        expect(output.lines[0]).toContain("instance is degraded");
    });

    it("fails when the instance is down", async () => {
        await expect(run("down").promise).rejects.toBeInstanceOf(
            InstanceDownError
        );
    });
});
