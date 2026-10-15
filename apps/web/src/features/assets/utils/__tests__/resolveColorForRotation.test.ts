import { describe, expect, it } from "vitest";
import { resolveColorForRotation } from "../resolveColorForRotation";
import { definition } from "./fixtures";

const base = definition({ id: "a", rotation: "DEG_0", colorKey: "red" });
const blue = definition({
    id: "b",
    baseAssetId: "a",
    rotation: "DEG_0",
    colorKey: "blue",
});
const red90 = definition({
    id: "c",
    baseAssetId: "a",
    rotation: "DEG_90",
    colorKey: "red",
});
const oak90 = definition({
    id: "d",
    baseAssetId: "a",
    rotation: "DEG_90",
    colorKey: "oak",
});

describe("resolveColorForRotation", () => {
    it("keeps the color when the new rotation has it", () => {
        expect(
            resolveColorForRotation([base, blue, red90, oak90], base, "DEG_90")
        ).toBe(red90);
    });

    it("falls back to the first color of the new rotation by id", () => {
        expect(
            resolveColorForRotation([base, blue, oak90], blue, "DEG_90")
        ).toBe(oak90);
    });

    it("is null when the rotation has no color", () => {
        expect(resolveColorForRotation([base], base, "DEG_180")).toBeNull();
    });

    it("never crosses families", () => {
        const other = definition({
            id: "z",
            baseAssetId: null,
            rotation: "DEG_90",
            colorKey: "red",
        });
        expect(
            resolveColorForRotation([base, other], base, "DEG_90")
        ).toBeNull();
    });
});
