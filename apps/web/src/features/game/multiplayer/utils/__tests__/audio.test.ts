import { describe, expect, it } from "vitest";
import {
    calculateVolumeFromDistance,
    checkIsSpeaking,
} from "@/features/game/multiplayer/utils/audio";

describe("calculateVolumeFromDistance", () => {
    it("is full volume at distance 0", () => {
        expect(calculateVolumeFromDistance(0, 400)).toBe(1);
    });

    it("is silent at exactly maxRadius", () => {
        expect(calculateVolumeFromDistance(400, 400)).toBe(0);
    });

    it("stays silent (never negative) beyond maxRadius", () => {
        expect(calculateVolumeFromDistance(800, 400)).toBe(0);
    });

    it("is half volume at half the radius", () => {
        expect(calculateVolumeFromDistance(200, 400)).toBe(0.5);
    });

    it("is full volume for a negative distance", () => {
        expect(calculateVolumeFromDistance(-50, 400)).toBe(1);
    });

    it("is silent when maxRadius is zero", () => {
        expect(calculateVolumeFromDistance(0, 0)).toBe(0);
    });
});

describe("checkIsSpeaking", () => {
    it("is false below the threshold", () => {
        expect(checkIsSpeaking(10, 20)).toBe(false);
    });

    it("is false exactly at the threshold", () => {
        expect(checkIsSpeaking(20, 20)).toBe(false);
    });

    it("is true above the threshold", () => {
        expect(checkIsSpeaking(21, 20)).toBe(true);
    });
});
