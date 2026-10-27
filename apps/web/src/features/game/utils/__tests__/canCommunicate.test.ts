import { describe, expect, it } from "vitest";
import {
    canCommunicate,
    getCommunicationDistance,
} from "@/features/game/utils/canCommunicate";
import { calculatePresetVolume } from "@/features/game/multiplayer/utils/proximityRadii";

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

    it("makes a blocked avatar unreachable by the volume", () => {
        const distance = getCommunicationDistance(10, null, "a");
        expect(distance).toBe(Number.POSITIVE_INFINITY);
        expect(calculatePresetVolume("Long", distance)).toBe(0);
    });
});
