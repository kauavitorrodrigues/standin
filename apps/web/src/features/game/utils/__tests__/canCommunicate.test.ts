import { describe, expect, it } from "vitest";
import {
    canCommunicate,
    getCommunicationDistance,
} from "@/features/game/utils/canCommunicate";
import { getPeerMediaPolicies } from "@/features/game/multiplayer/utils/mediaPolicy";
import { calculateVolumeFromDistance } from "@/features/game/multiplayer/utils/audio";
import { MAX_AUDIBLE_RADIUS } from "@/features/game/multiplayer/consts/audio";

describe("canCommunicate", () => {
    it("allows two avatars in the same room", () => {
        expect(canCommunicate("a", "a")).toBe(true);
    });

    it("allows two avatars outside every room", () => {
        expect(canCommunicate(null, null)).toBe(true);
    });

    it("blocks a different room", () => {
        expect(canCommunicate("a", "b")).toBe(false);
    });

    it("blocks local inside and remote outside, and the reverse", () => {
        expect(canCommunicate("a", null)).toBe(false);
        expect(canCommunicate(null, "a")).toBe(false);
    });
});

describe("getCommunicationDistance", () => {
    it("keeps the distance when they can communicate", () => {
        expect(getCommunicationDistance(40, "a", "a")).toBe(40);
        expect(getCommunicationDistance(40, null, null)).toBe(40);
    });

    it("makes a blocked avatar unreachable by media policies and volume", () => {
        const distance = getCommunicationDistance(10, null, "a");
        expect(distance).toBe(Number.POSITIVE_INFINITY);
        expect(calculateVolumeFromDistance(distance, MAX_AUDIBLE_RADIUS)).toBe(
            0
        );

        const policies = getPeerMediaPolicies(
            new Map([["peer", distance]]),
            new Set(["peer"])
        );
        expect(policies.get("peer")).toEqual({ audio: false, video: false });
    });
});
