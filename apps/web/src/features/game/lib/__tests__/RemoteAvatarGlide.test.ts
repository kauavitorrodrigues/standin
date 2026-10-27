import { describe, expect, it } from "vitest";
import { RemoteAvatarGlide } from "../RemoteAvatarGlide";

const FRAME_MS = 16;

// Plays frames until `untilMs`, returning whether it walked on every frame.
const runFrames = (
    glide: RemoteAvatarGlide,
    clock: { now: number },
    untilMs: number
): boolean[] => {
    const walking: boolean[] = [];
    while (clock.now < untilMs) {
        clock.now += FRAME_MS;
        glide.advance(FRAME_MS);
        walking.push(glide.isMoving(clock.now));
    }
    return walking;
};

describe("RemoteAvatarGlide", () => {
    it("moves steadily toward the snapshot instead of jumping", () => {
        const glide = new RemoteAvatarGlide(0, 0);
        const clock = { now: 0 };
        glide.push(10, 0, clock.now);
        glide.push(20, 0, (clock.now = 100));

        const xs: number[] = [];
        for (let i = 0; i < 6; i += 1) {
            glide.advance(FRAME_MS);
            xs.push(glide.x);
        }

        const steps = xs.map((x, i) => x - (xs[i - 1] ?? 0));
        expect(Math.max(...xs)).toBeLessThan(20);
        steps.slice(1).forEach((step) => expect(step).toBeGreaterThan(0));
        expect(steps[1]).toBeCloseTo(steps[4], 5);
    });

    it("keeps walking across 10 Hz snapshots that arrive late", () => {
        const glide = new RemoteAvatarGlide(0, 0);
        const clock = { now: 0 };
        glide.push(8, 0, 0);
        const walking: boolean[] = [];
        let x = 8;
        // A peer walking at 10 Hz with up to 40 ms of jitter on the arrival.
        [100, 205, 290, 410, 500, 615].forEach((arrivesAt) => {
            walking.push(...runFrames(glide, clock, arrivesAt));
            x += 8;
            glide.push(x, 0, clock.now);
        });

        expect(walking.every(Boolean)).toBe(true);
    });

    it("stops walking once a snapshot repeats the position", () => {
        const glide = new RemoteAvatarGlide(0, 0);
        const clock = { now: 0 };
        glide.push(8, 0, 0);
        runFrames(glide, clock, 100);
        glide.push(8, 0, clock.now);

        runFrames(glide, clock, clock.now + 200);

        expect(glide.isMoving(clock.now)).toBe(false);
        expect(glide.x).toBeCloseTo(8, 5);
    });

    it("snaps without walking to the first position", () => {
        const glide = new RemoteAvatarGlide(0, 0);

        glide.snapTo(50, 60);
        glide.push(50, 60, 0);

        expect(glide.x).toBe(50);
        expect(glide.isMoving(0)).toBe(false);
    });
});
