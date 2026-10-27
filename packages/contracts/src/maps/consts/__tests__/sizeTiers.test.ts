import { describe, expect, it } from "vitest";
import { MAX_SPACE_CAPACITY } from "../constants";
import { ENABLED_SIZE_TIERS, SIZE_TIERS } from "../size-tiers";

describe("size tiers", () => {
    it("enables every tier now that one space holds up to the media capacity", () => {
        expect(ENABLED_SIZE_TIERS).toEqual(Object.keys(SIZE_TIERS));
    });

    it("never promises more people than one space holds", () => {
        Object.values(SIZE_TIERS).forEach((tier) => {
            expect(tier.maxPeople).toBeLessThanOrEqual(MAX_SPACE_CAPACITY);
            expect(tier.minPeople).toBeLessThanOrEqual(tier.maxPeople);
        });
    });
});
