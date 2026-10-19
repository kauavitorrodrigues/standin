import { describe, expect, it } from "vitest";
import {
    AvatarBaseListSchema,
    CreateAvatarBaseDataSchema,
    UpdateAvatarBaseSchema,
} from "../avatar-base.schema";
import {
    AvatarCategoryListSchema,
    UpdateAvatarCategorySchema,
} from "../avatar-category.schema";
import { AvatarConfigSchema } from "../avatar-config.schema";
import {
    AvatarCategoryPartsPageSchema,
    AvatarCategoryPartsQuerySchema,
    AvatarEditorSchema,
} from "../avatar-editor.schema";
import {
    AvatarPartListQuerySchema,
    CreateAvatarPartDataSchema,
    CreateAvatarVariationDataSchema,
    UpdateAvatarPartSchema,
} from "../avatar-part.schema";

describe("CreateAvatarPartDataSchema", () => {
    const valid = { name: "Long hair", slot: "HAIR" };

    it("accepts a part with and without key and color", () => {
        expect(CreateAvatarPartDataSchema.safeParse(valid).success).toBe(true);
        expect(
            CreateAvatarPartDataSchema.safeParse({ ...valid, key: "long-hair" })
                .success
        ).toBe(true);
        expect(
            CreateAvatarPartDataSchema.safeParse({
                ...valid,
                colorKey: "red",
                colorHex: "#F03827",
            }).success
        ).toBe(true);
    });

    it.each([
        { name: "" },
        { name: "   " },
        { slot: "TAIL" },
        { key: "" },
        { key: "a".repeat(101) },
        { colorKey: "red" },
        { colorHex: "#F03827" },
        { colorKey: "red", colorHex: "#f03827" },
        { colorKey: "", colorHex: "#F03827" },
        { colorKey: "a".repeat(33), colorHex: "#F03827" },
    ])("rejects %j", (override) => {
        expect(
            CreateAvatarPartDataSchema.safeParse({ ...valid, ...override })
                .success
        ).toBe(false);
    });

    it("rejects a missing slot", () => {
        expect(
            CreateAvatarPartDataSchema.safeParse({ name: "A" }).success
        ).toBe(false);
    });
});

describe("CreateAvatarVariationDataSchema", () => {
    it("needs both the color name and the color", () => {
        expect(
            CreateAvatarVariationDataSchema.safeParse({
                colorKey: "blue",
                colorHex: "#2DBDFF",
            }).success
        ).toBe(true);
        expect(
            CreateAvatarVariationDataSchema.safeParse({ colorKey: "blue" })
                .success
        ).toBe(false);
        expect(
            CreateAvatarVariationDataSchema.safeParse({ colorHex: "#2DBDFF" })
                .success
        ).toBe(false);
    });
});

describe("UpdateAvatarPartSchema", () => {
    it("accepts a name, a color pair, or both", () => {
        expect(UpdateAvatarPartSchema.safeParse({ name: "B" }).success).toBe(
            true
        );
        expect(
            UpdateAvatarPartSchema.safeParse({
                colorKey: "red",
                colorHex: "#F03827",
            }).success
        ).toBe(true);
    });

    it.each([
        {},
        { slot: "HAIR" },
        { key: "x" },
        { name: "" },
        { colorKey: "red" },
        { colorHex: "#F03827" },
        { colorable: true },
    ])("rejects %j", (body) => {
        expect(UpdateAvatarPartSchema.safeParse(body).success).toBe(false);
    });
});

describe("AvatarPartListQuerySchema", () => {
    it("accepts an empty query and a known slot", () => {
        expect(AvatarPartListQuerySchema.safeParse({}).success).toBe(true);
        expect(
            AvatarPartListQuerySchema.safeParse({ slot: "HAT" }).success
        ).toBe(true);
    });

    it("rejects an unknown slot", () => {
        expect(AvatarPartListQuerySchema.safeParse({ slot: "X" }).success).toBe(
            false
        );
    });
});

describe("AvatarConfigSchema", () => {
    it("accepts an empty config, with and without base", () => {
        expect(AvatarConfigSchema.safeParse({ parts: [] }).success).toBe(true);
        expect(
            AvatarConfigSchema.safeParse({ baseId: null, parts: [] }).success
        ).toBe(true);
        expect(
            AvatarConfigSchema.safeParse({
                baseId: "base-1",
                parts: [
                    { slot: "SKIN", partId: "a" },
                    { slot: "HAIR", partId: "b" },
                ],
            }).success
        ).toBe(true);
    });

    it.each([
        [{ parts: [{ slot: "SKIN", partId: "" }] }],
        [{ parts: [{ slot: "NOPE", partId: "a" }] }],
        [{ baseId: "", parts: [] }],
        [
            {
                parts: [
                    { slot: "SKIN", partId: "a" },
                    { slot: "SKIN", partId: "b" },
                ],
            },
        ],
        [{}],
    ])("rejects %j", (body) => {
        expect(AvatarConfigSchema.safeParse(body).success).toBe(false);
    });

    it("drops a color sent by an old client", () => {
        const parsed = AvatarConfigSchema.parse({
            parts: [{ slot: "SKIN", partId: "a", color: "#FDDAB5" }],
        });
        expect(parsed.parts[0]).toEqual({ slot: "SKIN", partId: "a" });
    });
});

describe("avatar categories", () => {
    it("updates the name and the order, nothing else", () => {
        expect(
            UpdateAvatarCategorySchema.safeParse({ name: "Hair", sortOrder: 2 })
                .success
        ).toBe(true);
        for (const body of [
            {},
            { slot: "HAIR" },
            { name: "" },
            { sortOrder: -1 },
            { sortOrder: 1.5 },
        ]) {
            expect(UpdateAvatarCategorySchema.safeParse(body).success).toBe(
                false
            );
        }
    });

    it("accepts the list shape", () => {
        expect(
            AvatarCategoryListSchema.safeParse({
                categories: [
                    {
                        slot: "HAIR",
                        name: "Hair",
                        sortOrder: 1,
                        previewUrl: null,
                    },
                ],
            }).success
        ).toBe(true);
    });
});

describe("avatar bases", () => {
    it("defaults isDefault to false and the kind to BODY when creating", () => {
        expect(CreateAvatarBaseDataSchema.parse({ name: "Blank" })).toEqual({
            name: "Blank",
            kind: "BODY",
            isDefault: false,
        });
        expect(
            CreateAvatarBaseDataSchema.parse({
                name: "Doll",
                kind: "MANNEQUIN",
            }).kind
        ).toBe("MANNEQUIN");
        expect(
            CreateAvatarBaseDataSchema.safeParse({ name: "X", kind: "HEAD" })
                .success
        ).toBe(false);
        expect(CreateAvatarBaseDataSchema.safeParse({ name: "" }).success).toBe(
            false
        );
    });

    it("never changes the kind when updating", () => {
        expect(
            UpdateAvatarBaseSchema.safeParse({ kind: "MANNEQUIN" }).success
        ).toBe(false);
    });

    it("only turns the default on when updating", () => {
        expect(
            UpdateAvatarBaseSchema.safeParse({ isDefault: true }).success
        ).toBe(true);
        expect(UpdateAvatarBaseSchema.safeParse({ name: "B" }).success).toBe(
            true
        );
        for (const body of [{}, { isDefault: false }, { key: "x" }]) {
            expect(UpdateAvatarBaseSchema.safeParse(body).success).toBe(false);
        }
    });

    it("accepts the list shape, one group for each kind", () => {
        expect(
            AvatarBaseListSchema.safeParse({
                groups: [
                    { kind: "BODY", bases: [] },
                    { kind: "MANNEQUIN", bases: [] },
                ],
            }).success
        ).toBe(true);
    });

    it("refuses the old flat list and a group of an unknown kind", () => {
        expect(AvatarBaseListSchema.safeParse({ bases: [] }).success).toBe(
            false
        );
        expect(
            AvatarBaseListSchema.safeParse({
                groups: [{ kind: "HEAD", bases: [] }],
            }).success
        ).toBe(false);
    });
});

describe("AvatarEditorSchema", () => {
    it("accepts the editor shape", () => {
        const editor = {
            categories: [{ slot: "HAIR", name: "Hair", previewUrl: null }],
            bases: [
                {
                    id: "b",
                    name: "Blank",
                    url: "/files/b",
                    previewUrl: null,
                    isDefault: true,
                },
            ],
            current: {
                baseId: null,
                parts: [
                    {
                        slot: "HAIR",
                        partId: "p2",
                        familyId: "p1",
                        url: "/files/p2",
                    },
                ],
            },
        };
        expect(AvatarEditorSchema.safeParse(editor).success).toBe(true);
        expect(AvatarEditorSchema.safeParse({ categories: [] }).success).toBe(
            false
        );
    });
});

describe("AvatarCategoryPartsQuerySchema", () => {
    it("defaults the limit and reads it from a string", () => {
        expect(AvatarCategoryPartsQuerySchema.parse({}).limit).toBe(24);
        expect(
            AvatarCategoryPartsQuerySchema.parse({ limit: "60" }).limit
        ).toBe(60);
    });

    it.each([{ limit: "0" }, { limit: "61" }, { limit: "x" }, { cursor: "" }])(
        "rejects %j",
        (query) => {
            expect(
                AvatarCategoryPartsQuerySchema.safeParse(query).success
            ).toBe(false);
        }
    );
});

describe("AvatarCategoryPartsPageSchema", () => {
    it("accepts a page with and without next cursor", () => {
        const item = {
            id: "p1",
            name: "Sneakers",
            previewUrl: "/files/preview",
            variations: [
                {
                    id: "p1",
                    colorKey: "red",
                    colorHex: "#F03827",
                    url: "/files/1",
                    previewUrl: "/files/preview",
                },
            ],
        };
        expect(
            AvatarCategoryPartsPageSchema.safeParse({
                items: [item],
                nextCursor: "abc",
            }).success
        ).toBe(true);
        expect(
            AvatarCategoryPartsPageSchema.safeParse({
                items: [],
                nextCursor: null,
            }).success
        ).toBe(true);
        expect(
            AvatarCategoryPartsPageSchema.safeParse({ items: [] }).success
        ).toBe(false);
    });
});
