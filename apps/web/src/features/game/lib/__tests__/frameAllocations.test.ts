import { runInNewContext } from "node:vm";
import { setFlagsFromString } from "node:v8";
import { describe, expect, it } from "vitest";
import type { EmoteParticleState } from "@/features/game/types/emote";
import type { HoverState, HoverTarget } from "@/features/game/types/hover";
import {
    advanceEmoteParticle,
    stepEmoteParticle,
} from "@/features/game/utils/stepEmoteParticle";
import { toHoverState, writeHoverState } from "@/features/game/utils/hover";

// Bytes of heap a frame costs, as the Node heap sees it. This is the bench
// of the old per-frame path against the one the scene runs now, so the
// figures can be reproduced with
// `pnpm --filter web exec vitest run frameAllocations`.
const FRAMES = 5000;
const PARTICLES = 32;

setFlagsFromString("--expose-gc");
const collect = runInNewContext("gc") as () => void;

// What a frame builds is kept alive until the end, so a scavenge in the middle
// of the run cannot hide it. A frame that builds nothing keeps nothing.
const kept: unknown[] = [];

const measureBytesPerFrame = (frame: () => unknown): number =>
    Math.max(0, measureRaw(frame) - measureRaw(() => null));

const measureRaw = (frame: () => unknown): number => {
    kept.length = 0;
    for (let warm = 0; warm < FRAMES; warm += 1) frame();
    collect();
    const before = process.memoryUsage().heapUsed;
    for (let index = 0; index < FRAMES; index += 1) kept.push(frame());
    const after = process.memoryUsage().heapUsed;
    return (after - before) / FRAMES;
};

const buildParticles = (): EmoteParticleState[] =>
    Array.from({ length: PARTICLES }, () => ({
        x: 0,
        y: 0,
        velocityX: 10,
        velocityY: -20,
        ageMs: 0,
        lifeMs: 1e12,
        delayMs: 0,
    }));

const camera = { zoom: 2, worldView: { x: 5, y: 5 } };
const target: HoverTarget = {
    id: "player",
    bounds: { x: 10, y: 10, width: 20, height: 30 },
};

describe("per frame allocations", () => {
    it("advances emote particles in place without allocating", () => {
        const stepped = buildParticles();
        const advanced = buildParticles();

        const before = measureBytesPerFrame(() => {
            for (let index = 0; index < stepped.length; index += 1) {
                kept.push(stepEmoteParticle(stepped[index], 16));
            }
            return null;
        });
        const after = measureBytesPerFrame(() => {
            for (let index = 0; index < advanced.length; index += 1) {
                advanceEmoteParticle(advanced[index], 16);
            }
            return null;
        });

        expect(after).toBeLessThan(before / 4 + 1);
    });

    it("writes the hover state into a reused object", () => {
        const out: HoverState = {
            id: "",
            screen: { x: 0, y: 0, width: 0, height: 0 },
        };

        const before = measureBytesPerFrame(() => {
            return toHoverState(target, camera as never);
        });
        const after = measureBytesPerFrame(() => {
            writeHoverState(target, camera as never, out);
            return null;
        });

        expect(after).toBeLessThan(before / 4 + 1);
    });
});
