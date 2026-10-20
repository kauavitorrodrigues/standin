import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS, randomAvatarConfig } from "@standin/contracts";
import type { AvatarCategoryPartItem } from "../../types/editor";
import { buildRandomCatalog, buildRandomParts } from "../randomDraft";
import type { RandomPool } from "../randomDraft";

const item = (id: string, colors: string[]): AvatarCategoryPartItem => ({
    id,
    name: id,
    previewUrl: `/files/${id}-preview`,
    variations: colors.map((color) => ({
        id: `${id}-${color}`,
        colorKey: color,
        colorHex: "#FFFFFF",
        url: `/files/${id}-${color}`,
        previewUrl: `/files/${id}-${color}-preview`,
    })),
});

const pools: RandomPool[] = [
    {
        slot: AVATAR_SLOTS.SKIN,
        items: [item("skin", ["light", "dark"])],
    },
    { slot: AVATAR_SLOTS.HAIR, items: [] },
];

describe("buildRandomCatalog", () => {
    it("keeps the order of the categories and the ids of every color", () => {
        expect(buildRandomCatalog(pools, "base-1")).toEqual({
            baseId: "base-1",
            slots: [
                {
                    slot: AVATAR_SLOTS.SKIN,
                    families: [{ variationIds: ["skin-light", "skin-dark"] }],
                },
                { slot: AVATAR_SLOTS.HAIR, families: [] },
            ],
        });
    });
});

describe("buildRandomParts", () => {
    it("turns the random config into parts with the sheets to draw", () => {
        const config = randomAvatarConfig(
            buildRandomCatalog(pools, null),
            () => 0
        );

        const parts = buildRandomParts(config.parts, pools);

        expect(parts.SKIN).toEqual({
            partId: "skin-light",
            familyId: "skin",
            colorKey: "light",
            url: "/files/skin-light",
        });
        expect(parts.HAIR).toBeNull();
    });

    it("skips a part that is not in the pools", () => {
        const parts = buildRandomParts(
            [{ slot: AVATAR_SLOTS.SKIN, partId: "ghost" }],
            pools
        );

        expect(parts.SKIN).toBeNull();
    });
});
