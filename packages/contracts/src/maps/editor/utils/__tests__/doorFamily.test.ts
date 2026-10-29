import { describe, expect, it } from "vitest";
import { makeAsset } from "../../../../assets/utils/__tests__/fixtures";
import { getDoorFamily, getDoorSizeBySide } from "../doorFamily";
import { getOccupiedKeys } from "../getOccupiedKeys";

const door = (id: string, rotation: string, w: number, h: number) =>
    makeAsset({
        id,
        type: "DOOR",
        baseAssetId: id === "d-n" ? null : "d-n",
        rotation: rotation as "DEG_0",
        footprint: { w, h, offsetX: 0 },
    });

const family = [
    door("d-n", "DEG_0", 2, 1),
    door("d-e", "DEG_90", 1, 2),
    door("d-s", "DEG_180", 2, 1),
    door("d-w", "DEG_270", 1, 2),
];
const crate = makeAsset({ id: "crate", footprint: { w: 2, h: 1, offsetX: 0 } });

describe("getDoorFamily", () => {
    it("gives every variant of the family of a door", () => {
        const found = getDoorFamily([...family, crate], "d-e");

        expect(found.map(({ id }) => id)).toEqual(["d-n", "d-e", "d-s", "d-w"]);
    });

    it("is empty for an asset that is not a door or is not there", () => {
        expect(getDoorFamily([...family, crate], "crate")).toEqual([]);
        expect(getDoorFamily(family, "missing")).toEqual([]);
    });
});

describe("getDoorSizeBySide", () => {
    it("gives the footprint of the variant of each side", () => {
        expect(getDoorSizeBySide(family)).toEqual({
            north: { w: 2, h: 1 },
            east: { w: 1, h: 2 },
            south: { w: 2, h: 1 },
            west: { w: 1, h: 2 },
        });
    });

    it("is null for a family with no variants", () => {
        expect(getDoorSizeBySide([])).toBeNull();
    });
});

describe("getOccupiedKeys", () => {
    it("lists the cells the placed objects cover", () => {
        const keys = getOccupiedKeys({
            library: {
                assets: [crate],
                tilesets: [],
                categories: [],
                areas: [],
            },
            placed: [{ id: "a", assetId: "crate", tileX: 3, tileY: 5 }],
        } as unknown as Parameters<typeof getOccupiedKeys>[0]);

        expect([...keys].sort()).toEqual(["3,5", "4,5"]);
    });
});
