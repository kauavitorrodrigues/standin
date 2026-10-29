import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaServer } from "@standin/media";

vi.mock("@/lib/socket/realtime/SpaceInterests", () => ({
    SpaceInterests: { indexOf: () => ({}) },
}));
vi.mock("@/lib/socket/socketManager", () => ({
    SocketManager: { emitToSocket: vi.fn(), get: () => ({ emit: vi.fn() }) },
}));
vi.mock("@/lib/socket/services/resolveSpaceSettings", () => ({
    resolveSpaceSettings: async () => ({}),
}));

import { MEDIA_LOAD_SAMPLE_MS } from "../consts/media";
import { MediaRuntime, mediaDirty } from "../MediaRuntime";
import { startMediaTicker } from "../startMediaTicker";

// The slow loop of the ticker reads the CPU time of the worker and holds back
// videos when it stays short of CPU. The server is a stand-in whose CPU time
// follows the share the test asks for.
describe("the load of the worker in the media ticker", () => {
    let cpuSeconds = 0;
    let share = 0;
    let shedCalls: number[] = [];
    let stop: () => void;

    beforeEach(() => {
        vi.useFakeTimers();
        cpuSeconds = 0;
        share = 0;
        shedCalls = [];
        const server = {
            usage: async () => ({ workerCpuSeconds: cpuSeconds }),
            setVideoShed: (level: number) => {
                shedCalls.push(level);
                return ["space-1"];
            },
            getRoom: () => ({ peerIds: () => ["p1", "p2"] }),
        };
        MediaRuntime.useServer(server as unknown as MediaServer);
        stop = startMediaTicker(60_000);
    });

    afterEach(() => {
        stop();
        MediaRuntime.useServer(null);
        mediaDirty.forget("space-1");
        vi.useRealTimers();
    });

    const run = async (seconds: number) => {
        for (let elapsed = 0; elapsed < seconds * 1000; elapsed += MEDIA_LOAD_SAMPLE_MS) {
            cpuSeconds += (share * MEDIA_LOAD_SAMPLE_MS) / 1000;
            await vi.advanceTimersByTimeAsync(MEDIA_LOAD_SAMPLE_MS);
        }
    };

    it("asks for a video to be held back after 10 seconds above 85 percent", async () => {
        share = 0.95;
        await run(8);
        expect(shedCalls.every((level) => level === 0)).toBe(true);

        await run(8);
        expect(shedCalls).toContain(1);
    });

    it("plans the receivers of the space again when the level changes", async () => {
        share = 0.95;
        await run(16);

        expect(mediaDirty.hasPending("space-1")).toBe(true);
    });

    it("does nothing while the worker is at ease", async () => {
        share = 0.3;
        await run(30);

        expect(shedCalls.every((level) => level === 0)).toBe(true);
    });
});
