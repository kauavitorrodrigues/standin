import { describe, expect, it } from "vitest";
import {
    calculateLongMagnitude,
    calculateProximityMagnitude,
    calculateShortMagnitude,
} from "../utils/proximityMagnitude";

// Expected values written out from the formulas.
const longCases = [
    { tiles: 0, audio: 1, video: 1 },
    { tiles: 2, audio: 1 - 0.1 * 2, video: 1 - 2 / 15 },
    { tiles: 5, audio: 0.5, video: 1 - 5 / 15 },
    { tiles: 12, audio: Math.max(0.5 / 1.485 ** 7, 0.1), video: Math.max(0.6667 / 1.5 ** 7, 0.1) },
];

const shortCases = [
    { tiles: 0, audio: 1, video: 1 },
    { tiles: 2, audio: 1, video: 1 },
    { tiles: 5, audio: 0, video: 0 },
    { tiles: 12, audio: 0, video: 0 },
];

describe("calculateLongMagnitude", () => {
    it.each(longCases)("A=$tiles", ({ tiles, audio, video }) => {
        const result = calculateLongMagnitude(tiles);

        expect(result.audio).toBeCloseTo(audio, 3);
        expect(result.video).toBeCloseTo(video, 3);
    });

    it("never reaches 0", () => {
        expect(calculateLongMagnitude(100)).toEqual({ audio: 0.1, video: 0.1 });
    });
});

describe("calculateShortMagnitude", () => {
    it.each(shortCases)("A=$tiles", ({ tiles, audio, video }) => {
        expect(calculateShortMagnitude(tiles)).toEqual({ audio, video });
    });

    it("decays between the plateau and the cutoff", () => {
        const result = calculateShortMagnitude(4);

        expect(result.audio).toBeCloseTo(1 / 1.5 ** 2, 10);
        expect(result.video).toBeCloseTo(1 / 2 ** 2, 10);
    });
});

describe("calculateProximityMagnitude", () => {
    it("dispatches by preset", () => {
        expect(calculateProximityMagnitude("Long", 12)).toEqual(calculateLongMagnitude(12));
        expect(calculateProximityMagnitude("Short", 3)).toEqual(calculateShortMagnitude(3));
    });
});
