import { describe, expect, it, vi } from "vitest";
import { shouldAcceptNearbyMessage } from "../shouldAcceptNearbyMessage";

const base = {
    text: "oi",
    distance: 100,
    radius: 384,
    isRateAllowed: () => true,
};

describe("shouldAcceptNearbyMessage", () => {
    it("accepts a valid text inside the radius", () => {
        expect(shouldAcceptNearbyMessage(base)).toBe(true);
    });

    it("accepts the edge of the radius and drops past it", () => {
        expect(shouldAcceptNearbyMessage({ ...base, distance: 384 })).toBe(
            true
        );
        expect(shouldAcceptNearbyMessage({ ...base, distance: 385 })).toBe(
            false
        );
    });

    it("drops another room, where the distance is infinite", () => {
        expect(
            shouldAcceptNearbyMessage({
                ...base,
                distance: Number.POSITIVE_INFINITY,
            })
        ).toBe(false);
    });

    it("drops a text that is not valid", () => {
        expect(shouldAcceptNearbyMessage({ ...base, text: 3 })).toBe(false);
        expect(shouldAcceptNearbyMessage({ ...base, text: " " })).toBe(false);
        expect(shouldAcceptNearbyMessage({ ...base, text: "a".repeat(51) })).toBe(
            false
        );
    });

    it("drops what is over the rate limit", () => {
        expect(
            shouldAcceptNearbyMessage({ ...base, isRateAllowed: () => false })
        ).toBe(false);
    });

    it("does not count against the rate what was already dropped", () => {
        const isRateAllowed = vi.fn(() => true);

        shouldAcceptNearbyMessage({ ...base, distance: 999, isRateAllowed });
        shouldAcceptNearbyMessage({ ...base, text: "", isRateAllowed });

        expect(isRateAllowed).not.toHaveBeenCalled();
    });
});
