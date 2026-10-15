import { describe, expect, it } from "vitest";
import { computeGid } from "../computeGid";
import {
    FLOOR_IMAGE_ID,
    WALL_IMAGE_ID,
    library,
} from "../../../layout/__tests__/fixtures";
import type { MapLayout } from "../../../schemas/layout.schema";

const layoutWith = (tilesets: MapLayout["tilesets"]): MapLayout =>
    ({ tilesets }) as MapLayout;

describe("computeGid", () => {
    it("adds the index to the firstgid of a tileset in the layout", () => {
        const layout = layoutWith([
            { name: FLOOR_IMAGE_ID, firstgid: 1 },
            { name: WALL_IMAGE_ID, firstgid: 5 },
        ]);
        expect(computeGid(layout, FLOOR_IMAGE_ID, 2, library)).toBe(3);
        expect(computeGid(layout, WALL_IMAGE_ID, 3, library)).toBe(8);
    });

    it("uses the firstgid the tileset would receive when it is missing", () => {
        const layout = layoutWith([{ name: FLOOR_IMAGE_ID, firstgid: 1 }]);
        expect(computeGid(layout, WALL_IMAGE_ID, 2, library)).toBe(1 + 4 + 2);
    });

    it("starts at 1 on a layout without tilesets", () => {
        expect(computeGid(layoutWith([]), FLOOR_IMAGE_ID, 0, library)).toBe(1);
    });
});
