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

describe("random draw over the whole catalog", () => {
    // A hair that exists only after the first page of the list.
    const laterPools: RandomPool[] = [
        { slot: AVATAR_SLOTS.SKIN, items: [item("skin", ["light"])] },
        {
            slot: AVATAR_SLOTS.HAIR,
            items: [item("first", ["a"]), item("later", ["b"])],
        },
    ];

    it("can draw a part from the end of the pool", () => {
        // skin: family roll, variation roll. hair: family roll 0.99 -> last.
        const rolls = [0, 0, 0.99, 0];
        const config = randomAvatarConfig(
            buildRandomCatalog(laterPools, null),
            () => rolls.shift() ?? 0
        );

        const parts = buildRandomParts(config.parts, laterPools);

        expect(parts.HAIR?.partId).toBe("later-b");
    });

    it("keeps an extra the draft has and clears the costume", () => {
        const pools: RandomPool[] = [
            ...laterPools,
            { slot: AVATAR_SLOTS.HAT, items: [item("hat", ["red"])] },
            { slot: AVATAR_SLOTS.COSTUME, items: [item("suit", ["blue"])] },
        ];
        const hat = {
            partId: "hat-red",
            familyId: "hat",
            colorKey: "red",
            url: "/files/hat-red",
        };
        const current = {
            ...buildRandomParts([], pools),
            HAT: hat,
            COSTUME: {
                partId: "suit-blue",
                familyId: "suit",
                colorKey: "blue",
                url: "/files/suit-blue",
            },
        };
        const currentConfig = [
            { slot: AVATAR_SLOTS.HAT, partId: "hat-red" },
            { slot: AVATAR_SLOTS.COSTUME, partId: "suit-blue" },
        ];

        // 0.9 never wins the extra chance, so the hat stays.
        const config = randomAvatarConfig(
            buildRandomCatalog(pools, null),
            () => 0.9,
            currentConfig
        );
        const parts = buildRandomParts(config.parts, pools, current);

        expect(parts.HAT).toEqual(hat);
        expect(parts.COSTUME).toBeNull();
        expect(parts.SKIN).not.toBeNull();
    });

    it("keeps the choice of a part that is no longer in the pools", () => {
        const deleted = {
            partId: "gone",
            familyId: "gone-family",
            colorKey: null,
            url: "/files/gone",
        };
        const current = { ...buildRandomParts([], pools), HAT: deleted };

        const parts = buildRandomParts(
            [{ slot: AVATAR_SLOTS.HAT, partId: "gone" }],
            pools,
            current
        );

        expect(parts.HAT).toEqual(deleted);
    });
});
