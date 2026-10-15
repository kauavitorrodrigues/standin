import { describe, expect, it } from "vitest";
import { buildVariantData } from "../buildVariantData";
import { getVariantKind } from "../getVariantKind";
import { validateAddVariant } from "../validateAddVariant";
import { family, png } from "./fixtures";
import type { AddVariantFormValues } from "../../types/addVariantForm";

const values = (
    overrides: Partial<AddVariantFormValues> = {}
): AddVariantFormValues => ({
    image: [png("mug-blue.png")],
    colorKey: "blue",
    colorHex: "#3F6FD1",
    rotation: "",
    footprintW: 1,
    footprintH: 1,
    footprintOffsetX: 0,
    footprintMask: null,
    footprintSolidMask: null,
    seats: [],
    targetX: undefined,
    targetY: undefined,
    ...overrides,
});

describe("getVariantKind", () => {
    it("is a color on a rotation the family has", () => {
        expect(getVariantKind(family([null]), "")).toBe("COLOR");
        expect(getVariantKind(family(["DEG_0", "DEG_90"]), "DEG_90")).toBe(
            "COLOR"
        );
    });

    it("is a rotation on any other", () => {
        expect(getVariantKind(family([null]), "DEG_90")).toBe("ROTATION");
    });
});

describe("buildVariantData", () => {
    it("sends only the color for a color on an existing rotation", () => {
        expect(buildVariantData(family([null]), values())).toEqual({
            color: { key: "blue", hex: "#3F6FD1" },
        });
    });

    it("sends footprint and the seats for a new rotation of a seat", () => {
        const seats = [{ dx: 16, dy: 8, facing: "LEFT" as const }];
        const data = buildVariantData(
            family([null], "SIT"),
            values({
                rotation: "DEG_90",
                footprintW: 1,
                footprintH: 2,
                seats,
            })
        );
        expect(data).toEqual({
            color: { key: "blue", hex: "#3F6FD1" },
            rotation: "DEG_90",
            footprint: { w: 1, h: 2, offsetX: 0 },
            actionParams: { seats },
        });
    });

    it("sends the target of a teleport", () => {
        const data = buildVariantData(
            family([null], "TELEPORT"),
            values({ rotation: "DEG_90", targetX: 4, targetY: 7 })
        );
        expect(data.actionParams).toEqual({ targetX: 4, targetY: 7 });
    });
});

describe("validateAddVariant", () => {
    it("accepts a complete color variant", () => {
        expect(validateAddVariant(family([null]), values())).toEqual({});
    });

    it("asks for the PNG and, when the family has color, the color", () => {
        const errors = validateAddVariant(
            family([null]),
            values({ image: [], colorKey: "", colorHex: "" })
        );
        expect(Object.keys(errors).sort()).toEqual([
            "colorHex",
            "colorKey",
            "image",
        ]);
    });

    it("rejects a bad hex and a seat without seats on a new rotation", () => {
        const errors = validateAddVariant(
            family([null], "SIT"),
            values({ colorHex: "blue", rotation: "DEG_90" })
        );
        expect(Object.keys(errors).sort()).toEqual(["colorHex", "seats"]);
    });

    it("asks for the target of a teleport on a new rotation", () => {
        const errors = validateAddVariant(
            family([null], "TELEPORT"),
            values({ rotation: "DEG_90" })
        );
        expect(Object.keys(errors).sort()).toEqual(["targetX", "targetY"]);
    });
});

describe("buildVariantData mask", () => {
    it("sends the mask of a new rotation", () => {
        const mask = Array.from({ length: 4 }, () => [
            true,
            true,
            true,
            true,
            false,
            false,
            false,
            false,
        ]);
        const data = buildVariantData(
            family(["DEG_0"]),
            values({ rotation: "DEG_90", footprintW: 2, footprintMask: mask })
        );
        expect(data.footprint).toEqual({
            w: 2,
            h: 1,
            offsetX: 0,
            mask,
        });
    });
});
