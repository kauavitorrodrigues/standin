import { describe, expect, it } from "vitest";
import { assetAnimationSchema } from "../asset-animation.schema";
import {
    CreateAssetDataSchema,
    CreateTilesetDataSchema,
    CreateVariantDataSchema,
    DeleteAssetQuerySchema,
    UpdateLibraryAssetSchema,
    UpdateLibraryColorSchema,
} from "../library-data.schema";

describe("assetAnimationSchema", () => {
    const valid = { frameCount: 6, frameDurationMs: 100, repeat: -1 };

    it("accepts a strip with infinite loop", () => {
        expect(assetAnimationSchema.safeParse(valid).success).toBe(true);
    });

    it.each([
        { frameCount: 1 },
        { frameCount: 2.5 },
        { frameDurationMs: 0 },
        { frameDurationMs: -10 },
        { repeat: -2 },
        { repeat: 1.5 },
    ])("rejects %j", (override) => {
        expect(
            assetAnimationSchema.safeParse({ ...valid, ...override }).success
        ).toBe(false);
    });

    it("accepts repeat 0 and a minimum of 2 frames", () => {
        expect(
            assetAnimationSchema.safeParse({
                frameCount: 2,
                frameDurationMs: 1,
                repeat: 0,
            }).success
        ).toBe(true);
    });
});

describe("CreateTilesetDataSchema", () => {
    it("needs only a name", () => {
        expect(
            CreateTilesetDataSchema.safeParse({ name: "Pisos" }).success
        ).toBe(true);
        expect(CreateTilesetDataSchema.safeParse({}).success).toBe(false);
    });

    it("rejects a negative margin and a bad tile index", () => {
        expect(
            CreateTilesetDataSchema.safeParse({ name: "a", margin: -1 }).success
        ).toBe(false);
        expect(
            CreateTilesetDataSchema.safeParse({
                name: "a",
                tileMeta: { x: { category: "FLOOR" } },
            }).success
        ).toBe(false);
    });
});

describe("CreateAssetDataSchema", () => {
    const valid = {
        name: "Caneca",
        type: "DECORATION",
        category: "FOOD_DRINK",
        footprint: { w: 1, h: 1 },
        color: { key: "red", hex: "#d64545" },
    };

    it("accepts the example of the spec and uppercases the hex", () => {
        const result = CreateAssetDataSchema.safeParse(valid);
        expect(result.success).toBe(true);
        expect(result.data?.color?.hex).toBe("#D64545");
    });

    it("accepts an animated asset", () => {
        expect(
            CreateAssetDataSchema.safeParse({
                ...valid,
                animation: { frameCount: 6, frameDurationMs: 100, repeat: -1 },
            }).success
        ).toBe(true);
    });

    it.each([
        { footprint: undefined },
        { footprint: { w: 0, h: 1 } },
        { type: "BED" },
        { color: { key: "Red", hex: "#D64545" } },
        { color: { key: "red", hex: "D64545" } },
        { animation: { frameCount: 1, frameDurationMs: 100, repeat: -1 } },
    ])("rejects %j", (override) => {
        expect(
            CreateAssetDataSchema.safeParse({ ...valid, ...override }).success
        ).toBe(false);
    });
});

describe("CreateAssetDataSchema footprint mask", () => {
    const valid = {
        name: "Mesa de canto",
        type: "DESK",
        footprint: {
            w: 2,
            h: 2,
            mask: [
                [true, true],
                [true, false],
            ],
        },
    };

    it("accepts a mask that fits the footprint", () => {
        expect(CreateAssetDataSchema.safeParse(valid).success).toBe(true);
    });

    it("accepts a null or absent mask", () => {
        const base = { ...valid.footprint, mask: null };
        expect(
            CreateAssetDataSchema.safeParse({ ...valid, footprint: base })
                .success
        ).toBe(true);
    });

    it.each([
        { mask: [[true, true]] },
        { mask: [[true], [true]] },
        {
            mask: [
                [false, false],
                [false, false],
            ],
        },
        { mask: [] },
        { mask: [[]] },
    ])("rejects %j", (override) => {
        expect(
            CreateAssetDataSchema.safeParse({
                ...valid,
                footprint: { ...valid.footprint, ...override },
            }).success
        ).toBe(false);
    });
});

describe("CreateVariantDataSchema", () => {
    it("accepts a new color", () => {
        expect(
            CreateVariantDataSchema.safeParse({
                key: "mug-blue",
                color: { key: "blue", hex: "#3F6FD1" },
            }).success
        ).toBe(true);
    });

    it("accepts a new rotation with footprint and actionParams", () => {
        expect(
            CreateVariantDataSchema.safeParse({
                rotation: "DEG_90",
                color: { key: "oak", hex: "#B98B5E" },
                footprint: { w: 1, h: 2, offsetX: 0 },
                actionParams: { seats: [] },
            }).success
        ).toBe(true);
    });

    it("rejects any other key", () => {
        expect(
            CreateVariantDataSchema.safeParse({ name: "Outro" }).success
        ).toBe(false);
    });
});

describe("UpdateLibraryAssetSchema", () => {
    it("requires at least one field", () => {
        expect(UpdateLibraryAssetSchema.safeParse({}).success).toBe(false);
        expect(UpdateLibraryAssetSchema.safeParse({ name: "x" }).success).toBe(
            true
        );
    });

    it.each([
        { footprint: { w: 2, h: 1 } },
        { color: { key: "red", hex: "#D64545" } },
    ])("rejects %j, it is not edited here", (body) => {
        expect(UpdateLibraryAssetSchema.safeParse(body).success).toBe(false);
    });

    it("rejects key and type", () => {
        expect(UpdateLibraryAssetSchema.safeParse({ key: "x" }).success).toBe(
            false
        );
        expect(
            UpdateLibraryAssetSchema.safeParse({ type: "CHAIR" }).success
        ).toBe(false);
    });

    it("accepts a partial animation", () => {
        expect(
            UpdateLibraryAssetSchema.safeParse({
                animation: { frameDurationMs: 80 },
            }).success
        ).toBe(true);
    });
});

describe("DeleteAssetQuerySchema", () => {
    it("parses family as a boolean", () => {
        expect(DeleteAssetQuerySchema.parse({ family: "true" }).family).toBe(
            true
        );
        expect(DeleteAssetQuerySchema.parse({}).family).toBe(false);
        expect(DeleteAssetQuerySchema.safeParse({ family: "x" }).success).toBe(
            false
        );
    });
});

describe("UpdateLibraryColorSchema", () => {
    it("accepts a color and nothing else", () => {
        const color = { key: "azul", hex: "#3F6FD1" };
        expect(UpdateLibraryColorSchema.safeParse({ color }).success).toBe(
            true
        );
        expect(
            UpdateLibraryColorSchema.safeParse({ color, name: "x" }).success
        ).toBe(false);
        expect(UpdateLibraryColorSchema.safeParse({}).success).toBe(false);
    });

    it.each([
        { key: "Azul", hex: "#3F6FD1" },
        { key: "azul", hex: "3F6FD1" },
    ])("rejects %j", (color) => {
        expect(UpdateLibraryColorSchema.safeParse({ color }).success).toBe(
            false
        );
    });
});
