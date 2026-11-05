import { describe, expect, it } from "vitest";
import type { TileMeta } from "@standin/contracts";
import { getFloorSelection } from "../getFloorSelection";
import { setTileCategory, setTileMaterial } from "../metaEdit";

const meta: TileMeta = {
    "0": { category: "FLOOR", material: "GRASS" },
    "1": { category: "FLOOR" },
    "2": { category: "WALL" },
};

describe("setTileMaterial", () => {
    it("sets the material of the floors and leaves the others alone", () => {
        const next = setTileMaterial(meta, [0, 1, 2], "STONE");

        expect(next["0"]?.material).toBe("STONE");
        expect(next["1"]?.material).toBe("STONE");
        expect(next["2"]).toEqual({ category: "WALL" });
    });

    it("clears the material with null", () => {
        expect(setTileMaterial(meta, [0], null)["0"]).toEqual({
            category: "FLOOR",
        });
    });
});

describe("setTileCategory", () => {
    const canEdit = () => true;

    it("gives a floor made from an untagged tile the wood material", () => {
        expect(setTileCategory({}, [5], "FLOOR", canEdit)["5"]).toEqual({
            category: "FLOOR",
            material: "WOOD",
        });
    });

    it("keeps the material on a floor and drops it from any other category", () => {
        expect(
            setTileCategory(meta, [0], "FLOOR", canEdit)["0"]?.material
        ).toBe("GRASS");
        expect(setTileCategory(meta, [0], "DECORATION", canEdit)["0"]).toEqual({
            category: "DECORATION",
        });
    });
});

describe("getFloorSelection", () => {
    it("reads a floor with no material as wood", () => {
        expect(getFloorSelection(meta, [1])).toEqual({
            floors: [1],
            material: "WOOD",
        });
    });

    it("has no shared material when the floors differ, and ignores walls", () => {
        expect(getFloorSelection(meta, [0, 1, 2])).toEqual({
            floors: [0, 1],
            material: null,
        });
    });
});
