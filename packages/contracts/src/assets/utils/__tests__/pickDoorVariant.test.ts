import { describe, expect, it } from "vitest";
import {
    DOOR_SIDE_BY_ROTATION,
    ROTATION_BY_DOOR_SIDE,
} from "../../consts/door";
import { pickDoorVariantForSide } from "../pickDoorVariant";
import { makeAsset } from "./fixtures";

const base = makeAsset({ id: "door", rotation: "DEG_0" });
const east = makeAsset({
    id: "door-90",
    baseAssetId: "door",
    rotation: "DEG_90",
});
const west = makeAsset({
    id: "door-270",
    baseAssetId: "door",
    rotation: "DEG_270",
});

describe("pickDoorVariantForSide", () => {
    it("returns the exact rotation for the side", () => {
        const variants = [base, east, west];
        expect(pickDoorVariantForSide(variants, "north")).toEqual({
            variant: base,
            exact: true,
        });
        expect(pickDoorVariantForSide(variants, "east")).toEqual({
            variant: east,
            exact: true,
        });
        expect(pickDoorVariantForSide(variants, "west")).toEqual({
            variant: west,
            exact: true,
        });
    });

    it("falls back to the base when the rotation is missing", () => {
        expect(pickDoorVariantForSide([base, east], "south")).toEqual({
            variant: base,
            exact: false,
        });
    });

    it("prefers the color of the base", () => {
        const red = makeAsset({
            id: "door-90-a",
            baseAssetId: "door",
            rotation: "DEG_90",
            colorKey: "red",
        });
        const plain = makeAsset({
            id: "door-90-b",
            baseAssetId: "door",
            rotation: "DEG_90",
        });
        expect(
            pickDoorVariantForSide([base, red, plain], "east")?.variant
        ).toBe(plain);
    });

    it("returns null without variants", () => {
        expect(pickDoorVariantForSide([], "north")).toBeNull();
    });

    it("keeps the two maps as inverses", () => {
        Object.entries(DOOR_SIDE_BY_ROTATION).forEach(([rotation, side]) => {
            expect(ROTATION_BY_DOOR_SIDE[side]).toBe(rotation);
        });
    });
});
