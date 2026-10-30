import { describe, expect, it } from "vitest";
import { clampVolume } from "../clampVolume";
import { percentToVolume } from "../percentToVolume";
import { volumeToPercent } from "../volumeToPercent";

describe("clampVolume", () => {
    it("keeps a volume inside the range", () => {
        expect(clampVolume(0.6)).toBe(0.6);
        expect(clampVolume(0)).toBe(0);
        expect(clampVolume(1)).toBe(1);
    });

    it("clamps below and above the range", () => {
        expect(clampVolume(-0.2)).toBe(0);
        expect(clampVolume(3)).toBe(1);
    });

    it("falls back to the default for NaN", () => {
        expect(clampVolume(Number.NaN)).toBe(1);
    });
});

describe("percent conversion", () => {
    it("turns the slider percent into a fraction", () => {
        expect(percentToVolume(60)).toBe(0.6);
        expect(percentToVolume(100)).toBe(1);
        expect(percentToVolume(0)).toBe(0);
    });

    it("rounds a fractional percent and clamps", () => {
        expect(percentToVolume(33.4)).toBe(0.33);
        expect(percentToVolume(250)).toBe(1);
        expect(percentToVolume(-5)).toBe(0);
    });

    it("turns a stored fraction into whole percent", () => {
        expect(volumeToPercent(0.6)).toBe(60);
        expect(volumeToPercent(0.333)).toBe(33);
        expect(volumeToPercent(9)).toBe(100);
    });

    it("round trips the values the slider produces", () => {
        for (let percent = 0; percent <= 100; percent++) {
            expect(volumeToPercent(percentToVolume(percent))).toBe(percent);
        }
    });
});
