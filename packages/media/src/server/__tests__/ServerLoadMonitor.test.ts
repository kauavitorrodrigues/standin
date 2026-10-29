import { describe, expect, it } from "vitest";
import { SERVER_LOAD } from "../../consts/server";
import { ServerLoadMonitor } from "../ServerLoadMonitor";

const STEP_MS = 2000;

// Feeds readings of a worker that uses this share of a core, for this long.
const run = (
    monitor: ServerLoadMonitor,
    clock: { now: number; cpu: number },
    share: number,
    forMs: number
): number => {
    let level = monitor.shed;
    for (let elapsed = 0; elapsed < forMs; elapsed += STEP_MS) {
        clock.now += STEP_MS;
        clock.cpu += (share * STEP_MS) / 1000;
        level = monitor.observe(clock.cpu, clock.now);
    }
    return level;
};

const start = () => {
    const monitor = new ServerLoadMonitor();
    const clock = { now: 1000, cpu: 0 };
    monitor.observe(clock.cpu, clock.now);
    return { monitor, clock };
};

describe("ServerLoadMonitor", () => {
    it("holds nothing back at the start, and on the first reading", () => {
        const monitor = new ServerLoadMonitor();
        expect(monitor.shed).toBe(0);
        expect(monitor.observe(100, 5000)).toBe(0);
    });

    it("does not react to a spike shorter than the hold time", () => {
        const { monitor, clock } = start();

        expect(run(monitor, clock, 0.95, SERVER_LOAD.HOLD_MS - STEP_MS)).toBe(0);
        run(monitor, clock, 0.3, SERVER_LOAD.HOLD_MS);
        expect(monitor.shed).toBe(0);
    });

    it("holds back a video after the hold time above the high share", () => {
        const { monitor, clock } = start();

        expect(run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS + STEP_MS)).toBe(1);
    });

    it("holds back one more for each hold time it stays there, up to the most", () => {
        const { monitor, clock } = start();

        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS + STEP_MS);
        expect(monitor.shed).toBe(1);
        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS);
        expect(monitor.shed).toBe(2);
        run(monitor, clock, 0.99, SERVER_LOAD.HOLD_MS * 3);
        expect(monitor.shed).toBe(SERVER_LOAD.MAX_SHED);
    });

    it("gives a video back for each hold time below the low share", () => {
        const { monitor, clock } = start();
        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS * 3);
        expect(monitor.shed).toBe(2);

        run(monitor, clock, 0.4, SERVER_LOAD.HOLD_MS + STEP_MS);
        expect(monitor.shed).toBe(1);
        run(monitor, clock, 0.4, SERVER_LOAD.HOLD_MS);
        expect(monitor.shed).toBe(0);
        run(monitor, clock, 0.1, SERVER_LOAD.HOLD_MS * 3);
        expect(monitor.shed).toBe(0);
    });

    it("changes nothing between the two shares, so it does not flicker", () => {
        const { monitor, clock } = start();
        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS + STEP_MS);
        expect(monitor.shed).toBe(1);

        // 80% is under the high line and over the low one.
        run(monitor, clock, 0.8, SERVER_LOAD.HOLD_MS * 5);
        expect(monitor.shed).toBe(1);
    });

    it("counts a hold time again when the load crosses back before it ends", () => {
        const { monitor, clock } = start();

        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS - STEP_MS);
        run(monitor, clock, 0.8, STEP_MS);
        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS - STEP_MS);

        expect(monitor.shed).toBe(0);
    });

    it("starts from nothing again when the worker starts again", () => {
        const { monitor, clock } = start();
        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS + STEP_MS);
        monitor.reset();

        expect(monitor.shed).toBe(0);
        // The CPU time of the new worker starts from zero, which is not a drop.
        expect(monitor.observe(0, clock.now + STEP_MS)).toBe(0);
    });

    it("notices a worker that started again by its CPU time going down", () => {
        const { monitor, clock } = start();
        run(monitor, clock, 0.9, SERVER_LOAD.HOLD_MS + STEP_MS);
        expect(monitor.shed).toBe(1);

        expect(monitor.observe(0.5, clock.now + STEP_MS)).toBe(0);
    });

    it("starts at 85 percent of a core, recovers under 70 and holds 10 seconds", () => {
        expect(SERVER_LOAD.HIGH_CPU_SHARE).toBe(0.85);
        expect(SERVER_LOAD.LOW_CPU_SHARE).toBe(0.7);
        expect(SERVER_LOAD.HOLD_MS).toBe(10_000);
    });
});
