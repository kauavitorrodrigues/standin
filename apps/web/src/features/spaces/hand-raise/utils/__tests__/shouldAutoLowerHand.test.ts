import { describe, expect, it } from "vitest";
import { shouldAutoLowerHand } from "../shouldAutoLowerHand";

describe("shouldAutoLowerHand", () => {
    it("lowers a raised hand when the grid view is left", () => {
        expect(shouldAutoLowerHand({ isGridView: false, isRaised: true })).toBe(
            true
        );
    });

    it("keeps the hand while the grid view is open", () => {
        expect(shouldAutoLowerHand({ isGridView: true, isRaised: true })).toBe(
            false
        );
    });

    it("does nothing when the hand is already down", () => {
        expect(
            shouldAutoLowerHand({ isGridView: false, isRaised: false })
        ).toBe(false);
    });
});
