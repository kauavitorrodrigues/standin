import { describe, expect, it } from "vitest";
import type { AvatarSlot } from "../../enums/slots";
import type { AvatarRandomCatalog } from "../../types/random";
import { randomAvatarConfig } from "../randomAvatarConfig";

const slotOf = (
    slot: AvatarSlot,
    families: string[][]
): AvatarRandomCatalog["slots"][number] => ({
    slot,
    families: families.map((variationIds) => ({ variationIds })),
});

const catalogOf = (
    slots: AvatarRandomCatalog["slots"],
    baseId: string | null = null
): AvatarRandomCatalog => ({ baseId, slots });

const sequence = (values: number[]) => {
    let index = 0;
    return () => values[Math.min(index++, values.length - 1)];
};

describe("randomAvatarConfig", () => {
    it("returns a config without parts for an empty catalog", () => {
        expect(randomAvatarConfig(catalogOf([]), () => 0)).toEqual({
            baseId: null,
            parts: [],
        });
    });

    it("keeps the base of the catalog", () => {
        expect(randomAvatarConfig(catalogOf([], "base-1"), () => 0)).toEqual({
            baseId: "base-1",
            parts: [],
        });
    });

    it("skips slots without parts or without variations", () => {
        const catalog = catalogOf([slotOf("SKIN", []), slotOf("HAIR", [[]])]);
        expect(randomAvatarConfig(catalog, () => 0).parts).toEqual([]);
    });

    it("always fills a slot with chance 1", () => {
        const catalog = catalogOf([slotOf("SKIN", [["s"]])]);
        // 0.999 is the worst case for a chance of 1.
        expect(randomAvatarConfig(catalog, () => 0.999).parts).toEqual([
            { slot: "SKIN", partId: "s" },
        ]);
    });

    it("skips a slot when the roll is at or above its chance", () => {
        const catalog = catalogOf([slotOf("COSTUME", [["c"]])]);
        expect(randomAvatarConfig(catalog, () => 0.03).parts).toEqual([]);
        expect(randomAvatarConfig(catalog, () => 0.02).parts).toHaveLength(1);
    });

    it("picks the family and then the variation from the rolls", () => {
        const catalog = catalogOf([
            slotOf("HAIR", [
                ["a1", "a2"],
                ["b1", "b2", "b3"],
            ]),
        ]);
        // chance roll, family roll (0.5 -> index 1), variation roll (0.999 -> last)
        const config = randomAvatarConfig(catalog, sequence([0, 0.5, 0.999]));
        expect(config.parts).toEqual([{ slot: "HAIR", partId: "b3" }]);
    });

    it("never repeats a slot", () => {
        const catalog = catalogOf([
            slotOf("SKIN", [["a"]]),
            slotOf("SKIN", [["b"]]),
        ]);
        expect(randomAvatarConfig(catalog, () => 0).parts).toHaveLength(1);
    });
});
