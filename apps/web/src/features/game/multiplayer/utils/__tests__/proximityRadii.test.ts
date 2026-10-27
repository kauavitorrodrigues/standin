import { describe, expect, it } from "vitest";
import { calculatePresetVolume, getProximityRadii } from "../proximityRadii";

describe("getProximityRadii", () => {
    it("converts the Long cutoff of 12 tiles to pixels", () => {
        expect(getProximityRadii("Long")).toEqual({
            enterRadius: 384,
            exitRadius: 414,
        });
    });

    it("converts the Short cutoff of 5 tiles to pixels", () => {
        expect(getProximityRadii("Short")).toEqual({
            enterRadius: 160,
            exitRadius: 190,
        });
    });
});

describe("calculatePresetVolume", () => {
    it("is silent for an unreachable person", () => {
        expect(calculatePresetVolume("Long", Number.POSITIVE_INFINITY)).toBe(0);
        expect(calculatePresetVolume("Short", Number.POSITIVE_INFINITY)).toBe(0);
    });

    it("is silent at and beyond the cutoff", () => {
        expect(calculatePresetVolume("Long", 384)).toBe(0);
        expect(calculatePresetVolume("Long", 500)).toBe(0);
        expect(calculatePresetVolume("Short", 160)).toBe(0);
    });

    it("is full on top of the person in the Short preset", () => {
        expect(calculatePresetVolume("Short", 0)).toBe(1);
        expect(calculatePresetVolume("Short", 32)).toBe(1);
    });

    it("is audible inside the cutoff in the Long preset", () => {
        expect(calculatePresetVolume("Long", 0)).toBe(1);
        expect(calculatePresetVolume("Long", 383)).toBeGreaterThan(0);
    });

    it("is quieter the farther the person is", () => {
        expect(calculatePresetVolume("Short", 100)).toBeLessThan(
            calculatePresetVolume("Short", 70)
        );
    });
});
