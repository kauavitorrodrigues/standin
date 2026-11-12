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

    it("always draws an essential slot, whatever the roll", () => {
        const catalog = catalogOf([slotOf("SKIN", [["s"]])]);
        // 0.999 would skip any slot that is not essential.
        expect(randomAvatarConfig(catalog, () => 0.999).parts).toEqual([
            { slot: "SKIN", partId: "s" },
        ]);
    });

    it("draws every essential slot again over the current parts", () => {
        const catalog = catalogOf(
            ["SKIN", "HAIR", "TOP", "BOTTOM", "SHOES"].map((slot) =>
                slotOf(slot as AvatarSlot, [["new"]])
            )
        );
        const current = [{ slot: "HAIR" as const, partId: "old" }];
        const parts = randomAvatarConfig(catalog, () => 0.9, current).parts;
        expect(parts).toHaveLength(5);
        expect(parts.every((part) => part.partId === "new")).toBe(true);
    });

    it("keeps the current part of an extra slot when the roll is at or above the chance", () => {
        const catalog = catalogOf([slotOf("HAT", [["new"]])]);
        const current = [{ slot: "HAT" as const, partId: "old" }];
        expect(randomAvatarConfig(catalog, () => 0.25, current).parts).toEqual(
            current
        );
    });

    it("leaves an extra slot empty when it had no part and the roll misses", () => {
        const catalog = catalogOf([slotOf("HAT", [["new"]])]);
        expect(randomAvatarConfig(catalog, () => 0.25).parts).toEqual([]);
    });

    it("draws an extra slot again when the roll is below the chance", () => {
        const catalog = catalogOf([slotOf("HAT", [["new"]])]);
        const current = [{ slot: "HAT" as const, partId: "old" }];
        expect(randomAvatarConfig(catalog, () => 0.24, current).parts).toEqual([
            { slot: "HAT", partId: "new" },
        ]);
    });

    it("never draws the costume and clears the current one", () => {
        const catalog = catalogOf([
            slotOf("COSTUME", [["c"]]),
            slotOf("SKIN", [["s"]]),
        ]);
        const current = [{ slot: "COSTUME" as const, partId: "old-costume" }];
        expect(randomAvatarConfig(catalog, () => 0, current).parts).toEqual([
            { slot: "SKIN", partId: "s" },
        ]);
    });

    it("clears the costume even when the catalog has none", () => {
        const current = [{ slot: "COSTUME" as const, partId: "old-costume" }];
        expect(
            randomAvatarConfig(catalogOf([]), () => 0, current).parts
        ).toEqual([]);
    });

    it("keeps the current part of a slot that has no parts to draw", () => {
        const catalog = catalogOf([slotOf("HAIR", [])]);
        const current = [{ slot: "HAIR" as const, partId: "old" }];
        expect(randomAvatarConfig(catalog, () => 0, current).parts).toEqual(
            current
        );
    });

    it("keeps the current part of a slot the catalog does not list", () => {
        const current = [{ slot: "GLASSES" as const, partId: "old" }];
        expect(
            randomAvatarConfig(catalogOf([]), () => 0, current).parts
        ).toEqual(current);
    });

    it("picks the family and then the variation from the rolls", () => {
        const catalog = catalogOf([
            slotOf("HAIR", [
                ["a1", "a2"],
                ["b1", "b2", "b3"],
            ]),
        ]);
        // family roll (0.5 -> index 1), variation roll (0.999 -> last)
        const config = randomAvatarConfig(catalog, sequence([0.5, 0.999]));
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
