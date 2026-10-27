import { describe, expect, it } from "vitest";
import {
    calculateVolumeFromDistance,
    checkIsSpeaking,
    getAudibleCeiling,
    selectAudiblePeers,
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

describe("selectAudiblePeers", () => {
    const peer = (id: string, volume: number, isSpeaking = false) => ({
        id,
        volume,
        isSpeaking,
    });

    it("keeps only the ceiling out of 12 peers", () => {
        const peers = Array.from({ length: 12 }, (_, i) =>
            peer(`p${i}`, 0.9 - i * 0.05)
        );
        expect(selectAudiblePeers(peers, 8).size).toBe(8);
        expect(selectAudiblePeers(peers, 4).size).toBe(4);
    });

    it("picks the nearest when nobody speaks", () => {
        const picked = selectAudiblePeers(
            [peer("far", 0.1), peer("near", 0.9), peer("mid", 0.5)],
            2
        );
        expect([...picked].sort()).toEqual(["mid", "near"]);
    });

    it("picks speakers before nearer silent peers", () => {
        const picked = selectAudiblePeers(
            [
                peer("near", 0.9),
                peer("far-speaker", 0.1, true),
                peer("mid", 0.5),
            ],
            2
        );
        expect([...picked].sort()).toEqual(["far-speaker", "near"]);
    });

    it("never picks peers out of range", () => {
        const picked = selectAudiblePeers(
            [peer("out", 0, true), peer("in", 0.2)],
            8
        );
        expect([...picked]).toEqual(["in"]);
    });
});

describe("getAudibleCeiling", () => {
    it("is 8 on a capable machine", () => {
        expect(
            getAudibleCeiling({ hardwareConcurrency: 8, deviceMemory: 8 })
        ).toBe(8);
    });

    it("is 4 with 4 cores or fewer", () => {
        expect(getAudibleCeiling({ hardwareConcurrency: 4 })).toBe(4);
    });

    it("is 4 with less than 8 GB", () => {
        expect(
            getAudibleCeiling({ hardwareConcurrency: 16, deviceMemory: 4 })
        ).toBe(4);
    });

    it("is 8 when the browser exposes neither signal", () => {
        expect(getAudibleCeiling({})).toBe(8);
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
