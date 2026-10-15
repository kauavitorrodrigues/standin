import { describe, expect, it } from "vitest";
import { validateFamily } from "../validateFamily";
import { COLORS, makeAsset } from "./fixtures";

const codes = (rows: Parameters<typeof validateFamily>[0]) =>
    validateFamily(rows).map(({ code }) => code);

const base = makeAsset({ id: "a1", ...COLORS.red });

describe("validateFamily", () => {
    it("accepts a base with color variations", () => {
        expect(
            validateFamily([
                base,
                makeAsset({ id: "a2", baseAssetId: "a1", ...COLORS.blue }),
                makeAsset({ id: "a3", baseAssetId: "a1", ...COLORS.green }),
            ])
        ).toEqual([]);
    });

    it("accepts rotations with their own footprint and size", () => {
        const rotated0 = makeAsset({
            id: "c1",
            rotation: "DEG_0",
            ...COLORS.oak,
            action: "SIT",
            actionParams: { seats: [{ dx: 0, dy: 0, facing: "DOWN" }] },
        });
        expect(
            validateFamily([
                rotated0,
                makeAsset({
                    id: "c2",
                    baseAssetId: "c1",
                    rotation: "DEG_90",
                    ...COLORS.oak,
                    action: "SIT",
                    sprite: { w: 32, h: 64 },
                    footprint: { w: 1, h: 2, offsetX: 0 },
                    actionParams: {
                        seats: [{ dx: 16, dy: -8, facing: "LEFT" }],
                    },
                }),
            ])
        ).toEqual([]);
    });

    it("requires exactly one base", () => {
        expect(codes([])).toEqual(["FAMILY_BASE_MISSING"]);
        expect(codes([base, makeAsset({ id: "a2", ...COLORS.blue })])).toEqual([
            "FAMILY_BASE_MISSING",
        ]);
    });

    it("flags a variation pointing at another row", () => {
        expect(
            codes([
                base,
                makeAsset({ id: "a2", baseAssetId: "zzz", ...COLORS.blue }),
            ])
        ).toContain("VARIANT_BASE_INVALID");
    });

    it("flags a color on a base with no color", () => {
        const plain = makeAsset({ id: "p1" });
        expect(
            codes([
                plain,
                makeAsset({ id: "p2", baseAssetId: "p1", ...COLORS.blue }),
            ])
        ).toEqual(["BASE_COLOR_REQUIRED"]);
    });

    it("flags a duplicated color and rotation", () => {
        expect(
            codes([
                base,
                makeAsset({ id: "a2", baseAssetId: "a1", ...COLORS.blue }),
                makeAsset({ id: "a3", baseAssetId: "a1", ...COLORS.blue }),
            ])
        ).toEqual(["VARIANT_DUPLICATED"]);
    });

    it("flags a diverging family field", () => {
        expect(
            codes([
                base,
                makeAsset({
                    id: "a2",
                    baseAssetId: "a1",
                    ...COLORS.blue,
                    name: "Outro nome",
                    solid: true,
                }),
            ])
        ).toEqual(["FAMILY_FIELD_DIVERGES", "FAMILY_FIELD_DIVERGES"]);
    });

    it("flags a diverging animation across the family", () => {
        const animated = makeAsset({
            id: "d1",
            ...COLORS.red,
            animation: { frameCount: 6, frameDurationMs: 100, repeat: -1 },
        });
        expect(
            codes([
                animated,
                makeAsset({
                    id: "d2",
                    baseAssetId: "d1",
                    ...COLORS.blue,
                    animation: {
                        frameCount: 6,
                        frameDurationMs: 200,
                        repeat: -1,
                    },
                }),
            ])
        ).toEqual(["FAMILY_FIELD_DIVERGES"]);
    });

    it("flags a diverging footprint inside a rotation", () => {
        expect(
            codes([
                base,
                makeAsset({
                    id: "a2",
                    baseAssetId: "a1",
                    ...COLORS.blue,
                    footprint: { w: 2, h: 1, offsetX: 0 },
                }),
            ])
        ).toEqual(["ROTATION_FIELD_DIVERGES"]);
    });

    it("flags a size mismatch inside a rotation", () => {
        expect(
            codes([
                base,
                makeAsset({
                    id: "a2",
                    baseAssetId: "a1",
                    ...COLORS.blue,
                    sprite: { w: 64, h: 32 },
                }),
            ])
        ).toEqual(["VARIANT_SIZE_MISMATCH"]);
    });

    it("flags inconsistent color fields", () => {
        expect(
            codes([makeAsset({ id: "x1", colorKey: "red", colorHex: null })])
        ).toEqual(["COLOR_FIELDS_INCONSISTENT"]);
    });

    it("flags an invalid color key and hex", () => {
        expect(
            codes([makeAsset({ id: "x1", colorKey: "Red!", colorHex: "red" })])
        ).toEqual(["COLOR_KEY_INVALID", "COLOR_HEX_INVALID"]);
    });
});
