import { describe, expect, it } from "vitest";
import { getColorSiblings, getFamilyBase, getFamilyId } from "../assetFamily";
import { COLORS, makeAsset } from "./fixtures";

const mug = [
    makeAsset({ id: "m1", ...COLORS.red }),
    makeAsset({ id: "m2", baseAssetId: "m1", ...COLORS.blue }),
    makeAsset({ id: "m3", baseAssetId: "m1", ...COLORS.green }),
    makeAsset({ id: "m4", baseAssetId: "m1", ...COLORS.oak }),
    makeAsset({
        id: "m5",
        baseAssetId: "m1",
        colorKey: "pink",
        colorHex: "#FFC0CB",
    }),
];

const monitor = [
    makeAsset({ id: "t1", ...COLORS.red }),
    makeAsset({ id: "t2", baseAssetId: "t1", ...COLORS.blue }),
    makeAsset({ id: "t3", baseAssetId: "t1", ...COLORS.green }),
];

describe("getFamilyId", () => {
    it("is the own id for a base and the base id for a variation", () => {
        expect(getFamilyId(mug[0])).toBe("m1");
        expect(getFamilyId(mug[3])).toBe("m1");
    });
});

describe("getColorSiblings", () => {
    const library = [...mug, ...monitor];

    it("returns the 5 colors of a mug, ordered by id, current included", () => {
        const siblings = getColorSiblings(library, mug[2]);
        expect(siblings.map(({ id }) => id)).toEqual([
            "m1",
            "m2",
            "m3",
            "m4",
            "m5",
        ]);
    });

    it("returns the 3 colors of a monitor", () => {
        expect(getColorSiblings(library, monitor[0])).toHaveLength(3);
    });

    it("is empty when the current asset has no color", () => {
        const plain = makeAsset({ id: "p1" });
        expect(getColorSiblings([plain], plain)).toEqual([]);
    });

    it("does not mix rotations", () => {
        const chairs = [
            makeAsset({ id: "c1", rotation: "DEG_0", ...COLORS.red }),
            makeAsset({
                id: "c2",
                baseAssetId: "c1",
                rotation: "DEG_0",
                ...COLORS.blue,
            }),
            makeAsset({
                id: "c3",
                baseAssetId: "c1",
                rotation: "DEG_90",
                ...COLORS.red,
            }),
            makeAsset({
                id: "c4",
                baseAssetId: "c1",
                rotation: "DEG_90",
                ...COLORS.blue,
            }),
        ];
        expect(getColorSiblings(chairs, chairs[0]).map(({ id }) => id)).toEqual(
            ["c1", "c2"]
        );
        expect(getColorSiblings(chairs, chairs[3]).map(({ id }) => id)).toEqual(
            ["c3", "c4"]
        );
    });
});

describe("getFamilyBase", () => {
    it("returns the row with no base asset", () => {
        expect(getFamilyBase([...mug].reverse()).id).toBe("m1");
    });

    it("throws when the family has no base", () => {
        expect(() => getFamilyBase([mug[1]])).toThrow();
    });
});
