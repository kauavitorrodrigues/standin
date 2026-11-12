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

    it("shows a jump across the map at once, without gliding", () => {
        const glide = new RemoteAvatarGlide(0, 0);
        const clock = { now: 0 };
        glide.push(8, 0, 0);
        runFrames(glide, clock, 100);

        glide.push(900, 640, clock.now);
        glide.advance(FRAME_MS);

        expect(glide.x).toBe(900);
        expect(glide.y).toBe(640);
        expect(glide.isMoving(clock.now)).toBe(false);
    });

    it("still glides over the longest step of a late snapshot", () => {
        const glide = new RemoteAvatarGlide(0, 0);
        glide.push(55, 0, 0);

        glide.advance(FRAME_MS);

        expect(glide.x).toBeGreaterThan(0);
        expect(glide.x).toBeLessThan(55);
    });

    it("snaps a jump of 4 and of 8 tiles", () => {
        [128, 256].forEach((distance) => {
            const glide = new RemoteAvatarGlide(0, 0);
            glide.push(0, 0, 0);

            glide.push(distance, 0, 100);

            expect(glide.x).toBe(distance);
            expect(glide.isMoving(100)).toBe(false);
        });
    });

    it("glides over a walking step of 22 px, of 55 px and of 2 tiles", () => {
        [22, 55, 64].forEach((step) => {
            const glide = new RemoteAvatarGlide(0, 0);
            glide.push(0, 0, 0);

            glide.push(step, 0, 100);
            glide.advance(FRAME_MS);

            expect(glide.x).toBeGreaterThan(0);
            expect(glide.x).toBeLessThan(step);
        });
    });

    it("glides at the distance from the last snapshot and snaps one px over", () => {
        const at = (x: number) => {
            const glide = new RemoteAvatarGlide(0, 0);
            glide.push(0, 0, 0);
            glide.push(x, 0, 100);
            return glide.x;
        };

        expect(at(96)).toBe(0);
        expect(at(97)).toBe(97);
    });

    it("glides at the distance from the drawn position and snaps one px over", () => {
        const at = (x: number) => {
            const glide = new RemoteAvatarGlide(0, 0);
            glide.push(0, 0, 0);
            glide.push(90, 0, 100);
            glide.push(x, 0, 200);
            return glide.x;
        };

        expect(at(160)).toBe(0);
        expect(at(161)).toBe(161);
    });

    it("snaps in a hidden tab, where the glide does not advance", () => {
        const glide = new RemoteAvatarGlide(0, 0);
        glide.push(0, 0, 0);
        glide.push(90, 0, 100);

        glide.push(180, 0, 200);

        expect(glide.x).toBe(180);
    });

    it("glides again on the push after a snap, over the time since it", () => {
        const glide = new RemoteAvatarGlide(0, 0);
        glide.push(0, 0, 0);
        glide.push(900, 640, 1000);

        glide.push(910, 640, 1100);
        glide.advance(50);

        expect(glide.x).toBeCloseTo(905, 5);
    });

    it("snaps without walking to the first position", () => {
        const glide = new RemoteAvatarGlide(0, 0);

        glide.snapTo(50, 60);
        glide.push(50, 60, 0);

        expect(glide.x).toBe(50);
        expect(glide.isMoving(0)).toBe(false);
    });
});

describe("RemoteAvatarGlide teleport count", () => {
    // A peer standing at the origin that has sent two snapshots.
    const settled = (count = 0) => {
        const glide = new RemoteAvatarGlide(0, 0);
        glide.push(0, 0, 0, count);
        glide.push(0, 0, 100, count);
        return glide;
    };

    it.each([1, 2, 3])("snaps a teleport of %i tiles at once", (tiles) => {
        const glide = settled();

        glide.push(tiles * 32, 0, 200, 1);

        expect(glide.x).toBe(tiles * 32);
        expect(glide.isMoving(200)).toBe(false);
    });

    it("glides while the count stays the same", () => {
        const glide = settled(4);

        glide.push(22, 0, 200, 4);
        glide.advance(FRAME_MS);

        expect(glide.x).toBeGreaterThan(0);
        expect(glide.x).toBeLessThan(22);
    });

    it("does not treat the first snapshot as a teleport", () => {
        const glide = new RemoteAvatarGlide(0, 0);

        glide.push(22, 0, 0, 9);
        glide.advance(FRAME_MS);

        expect(glide.x).toBeGreaterThan(0);
        expect(glide.x).toBeLessThan(22);
    });

    it("snaps on the next snapshot when the one with the change was lost", () => {
        const glide = settled(1);

        // The snapshot that carried count 2 never arrived.
        glide.push(40, 0, 300, 3);

        expect(glide.x).toBe(40);
    });

    it("snaps when the count wraps around", () => {
        const glide = settled(255);

        glide.push(30, 0, 200, 0);

        expect(glide.x).toBe(30);
    });

    it("glides again on the snapshot after the teleport", () => {
        const glide = settled();
        glide.push(64, 0, 200, 1);

        glide.push(74, 0, 300, 1);
        glide.advance(50);

        expect(glide.x).toBeCloseTo(69, 5);
    });
});
