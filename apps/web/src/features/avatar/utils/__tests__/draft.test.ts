import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS } from "@standin/contracts";
import type {
    AvatarCategoryPartItem,
    AvatarEditor,
    AvatarEditorBase,
} from "../../types/editor";
import {
    buildConfig,
    buildFormValues,
    createEmptyParts,
    findChosenFamily,
    getSwatchVariations,
    hasAnyPart,
    isChoiceDeleted,
    pickVariation,
    resolveDraftBase,
    toDraftChoice,
} from "../draft";

const editor = (overrides: Partial<AvatarEditor["current"]> = {}) =>
    ({
        categories: [
            { slot: AVATAR_SLOTS.HAIR, name: "Hair", previewUrl: null },
            { slot: AVATAR_SLOTS.TOP, name: "Top", previewUrl: null },
        ],
        bases: [],
        current: { baseId: null, parts: [], ...overrides },
    }) satisfies AvatarEditor;

const family: AvatarCategoryPartItem = {
    id: "shoe",
    name: "Sneakers",
    previewUrl: "/files/shoe-preview",
    variations: [
        {
            id: "shoe-red",
            colorKey: "red",
            colorHex: "#F03827",
            url: "/files/shoe-red",
            previewUrl: "/files/shoe-red-preview",
        },
        {
            id: "shoe-blue",
            colorKey: "blue",
            colorHex: "#2DBDFF",
            url: "/files/shoe-blue",
            previewUrl: "/files/shoe-blue-preview",
        },
    ],
};

const base = (id: string, isDefault: boolean): AvatarEditorBase => ({
    id,
    name: id,
    url: `/files/${id}`,
    previewUrl: null,
    isDefault,
});

describe("buildFormValues", () => {
    it("starts empty and on the first category without an avatar", () => {
        const values = buildFormValues(editor());

        expect(values.activeSlot).toBe(AVATAR_SLOTS.HAIR);
        expect(values.baseId).toBeNull();
        expect(hasAnyPart(values)).toBe(false);
    });

    it("fills the slots with what the person has now, deleted parts included", () => {
        const values = buildFormValues(
            editor({
                baseId: "base-2",
                parts: [
                    {
                        slot: AVATAR_SLOTS.HAIR,
                        partId: "hair-1",
                        familyId: "hair",
                        url: "/files/hair-1",
                    },
                ],
            })
        );

        expect(values.baseId).toBe("base-2");
        expect(values.parts.HAIR).toEqual({
            partId: "hair-1",
            familyId: "hair",
            colorKey: null,
            url: "/files/hair-1",
        });
        expect(values.parts.TOP).toBeNull();
    });
});

describe("buildConfig", () => {
    it("sends the base and only the slots that have a part", () => {
        const parts = createEmptyParts();
        parts.SHOES = toDraftChoice(family, family.variations[1]);

        expect(buildConfig({ baseId: "base-1", parts })).toEqual({
            baseId: "base-1",
            parts: [{ slot: AVATAR_SLOTS.SHOES, partId: "shoe-blue" }],
        });
    });

    it("sends no parts for an empty draft", () => {
        expect(
            buildConfig({ baseId: null, parts: createEmptyParts() })
        ).toEqual({ baseId: null, parts: [] });
    });
});

describe("pickVariation", () => {
    it("keeps the color the slot had when the family offers it", () => {
        expect(pickVariation(family, "blue")?.id).toBe("shoe-blue");
    });

    it("falls back to the base row of the family", () => {
        expect(pickVariation(family, "green")?.id).toBe("shoe-red");
        expect(pickVariation(family, null)?.id).toBe("shoe-red");
    });
});

describe("getSwatchVariations", () => {
    it("lists the colors of a family with more than one", () => {
        expect(getSwatchVariations(family)).toHaveLength(2);
    });

    it("shows nothing for a single color, a part without color or no family", () => {
        expect(
            getSwatchVariations({
                ...family,
                variations: [family.variations[0]],
            })
        ).toEqual([]);
        expect(
            getSwatchVariations({
                ...family,
                variations: [
                    { ...family.variations[0], colorKey: null, colorHex: null },
                    { ...family.variations[1], colorKey: null, colorHex: null },
                ],
            })
        ).toEqual([]);
        expect(getSwatchVariations(undefined)).toEqual([]);
    });
});

describe("deleted parts", () => {
    const choice = toDraftChoice(family, family.variations[0]);

    it("finds the family of the chosen part in the loaded items", () => {
        expect(findChosenFamily([family], choice)).toBe(family);
        expect(findChosenFamily([], choice)).toBeUndefined();
        expect(findChosenFamily([family], null)).toBeUndefined();
    });

    it("only calls a part deleted once the whole list is loaded", () => {
        expect(isChoiceDeleted([], choice, false)).toBe(false);
        expect(isChoiceDeleted([], choice, true)).toBe(true);
        expect(isChoiceDeleted([family], choice, true)).toBe(false);
        expect(isChoiceDeleted([], null, true)).toBe(false);
    });
});

describe("resolveDraftBase", () => {
    const bases = [base("a", false), base("b", true)];

    it("uses the chosen base, else the default, else the first", () => {
        expect(resolveDraftBase(bases, "a")?.id).toBe("a");
        expect(resolveDraftBase(bases, null)?.id).toBe("b");
        expect(resolveDraftBase([base("a", false)], null)?.id).toBe("a");
        expect(resolveDraftBase([], null)).toBeUndefined();
    });
});
