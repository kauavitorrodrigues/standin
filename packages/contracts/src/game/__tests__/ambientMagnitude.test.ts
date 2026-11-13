import { describe, expect, it } from "vitest";
import { PROXIMITY_PRESETS } from "../consts/proximity";
import { AMBIENT_FALLOFF_DB } from "../consts/ambient";
import { calculateProximityMagnitude } from "../utils/proximityMagnitude";
import {
    calculateAmbientVolume,
    getAmbientPeak,
    getAmbientBand,
} from "../utils/ambientMagnitude";

describe("getAmbientBand", () => {
    it("starts at the cutoff of the preset", () => {
        expect(getAmbientBand("Short", "short")).toEqual({
            innerTiles: 5,
            outerTiles: 9,
        });
        expect(getAmbientBand("Long", "long")).toEqual({
            innerTiles: 12,
            outerTiles: 22,
        });
    });

    it("has no width when the range is off", () => {
        const band = getAmbientBand("Long", "off");

        expect(band.outerTiles).toBe(band.innerTiles);
    });
});

const db = (volume: number, reference: number) =>
    20 * Math.log10(volume / reference);

describe("calculateAmbientVolume", () => {
    it("is silent inside the proximity ring", () => {
        expect(calculateAmbientVolume("Short", "short", 4.9)).toBe(0);
    });

    it.each([
        ["Short", "short"],
        ["Short", "long"],
        ["Long", "short"],
        ["Long", "long"],
    ] as const)("falls in dB from the peak (%s, %s)", (preset, range) => {
        const { innerTiles, outerTiles } = getAmbientBand(preset, range);
        const peak = getAmbientPeak(preset);
        const middle = (innerTiles + outerTiles) / 2;
        const justBefore = outerTiles - 0.001;

        expect(calculateAmbientVolume(preset, range, innerTiles)).toBe(peak);
        expect(
            db(calculateAmbientVolume(preset, range, middle), peak)
        ).toBeCloseTo(-AMBIENT_FALLOFF_DB / 2, 5);
        expect(
            db(calculateAmbientVolume(preset, range, justBefore), peak)
        ).toBeCloseTo(-AMBIENT_FALLOFF_DB, 1);
        expect(calculateAmbientVolume(preset, range, outerTiles)).toBe(0);
        expect(calculateAmbientVolume(preset, range, outerTiles + 5)).toBe(0);
    });

    it("never rises with the distance", () => {
        let last = Infinity;
        for (let tiles = 5; tiles < 9; tiles += 0.25) {
            const volume = calculateAmbientVolume("Short", "short", tiles);

            expect(volume).toBeLessThanOrEqual(last);
            last = volume;
        }
    });

    it("is silent when the range is off", () => {
        expect(calculateAmbientVolume("Short", "off", 5)).toBe(0);
        expect(calculateAmbientVolume("Long", "off", 12)).toBe(0);
    });

    it.each(["Short", "Long"] as const)(
        "starts quieter than the proximity voice just inside the edge (%s)",
        (preset) => {
            const edge = PROXIMITY_PRESETS[preset].thresholdTiles;
            const ambient = calculateAmbientVolume(preset, "long", edge);
            const proximity = calculateProximityMagnitude(
                preset,
                edge - 0.01
            ).audio;

            expect(ambient).toBeGreaterThan(0);
            expect(ambient).toBeLessThanOrEqual(proximity);
        }
    );

    it("gives the same peak every time", () => {
        expect(getAmbientPeak("Long")).toBe(getAmbientPeak("Long"));
    });
});
