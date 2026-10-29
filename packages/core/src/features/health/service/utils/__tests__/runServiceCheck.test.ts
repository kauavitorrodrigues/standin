import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runServiceCheck } from "../runServiceCheck";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

const after = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

describe("runServiceCheck", () => {
    it("is ok when the probe answers at once", async () => {
        const result = await runServiceCheck(async () => undefined);

        expect(result.status).toBe("ok");
    });

    it("is degraded when the probe answers late but in time", async () => {
        const pending = runServiceCheck(() => after(800), 2000);
        await vi.advanceTimersByTimeAsync(800);

        const result = await pending;
        expect(result.status).toBe("degraded");
        expect(result.latencyMs).toBeGreaterThanOrEqual(800);
    });

    it("is down when the probe passes the time limit, and aborts it", async () => {
        let received: AbortSignal | undefined;
        const pending = runServiceCheck((signal) => {
            received = signal;
            return new Promise(() => {});
        }, 2000);
        await vi.advanceTimersByTimeAsync(2000);

        expect((await pending).status).toBe("down");
        expect(received?.aborted).toBe(true);
    });

    it("is down, without throwing, when the probe throws", async () => {
        const result = await runServiceCheck(async () => {
            throw new Error("connect ECONNREFUSED");
        });

        expect(result.status).toBe("down");
    });

    it("is down when the probe throws before returning a promise", async () => {
        const result = await runServiceCheck(() => {
            throw new Error("sync failure");
        });

        expect(result.status).toBe("down");
    });

    it("clears its timer when the probe finishes", async () => {
        await runServiceCheck(async () => undefined);
        expect(vi.getTimerCount()).toBe(0);

        await runServiceCheck(async () => {
            throw new Error("boom");
        });
        expect(vi.getTimerCount()).toBe(0);
    });
});
