import { describe, expect, it } from "vitest";
import {
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    MAX_OBJECTS_PER_MAP,
    MapAssetLimitExceededError,
    MapAssetNotOnDeskTopError,
    MapAssetNotOnWallError,
    MapAssetOutOfBoundsError,
    MapAssetPositionOccupiedError,
    MapAssetSurfaceOccupiedError,
    MapAssetSurfaceRequiredError,
    expandTileMask,
    generateBlankLayout,
} from "@standin/contracts";
import type { Item } from "../../types/item";
import type { MapInfo } from "../../types/map-info";
import { acceptsSurfaceItems } from "../acceptsSurfaceItems";
import { assertGroundPosition } from "../assertGroundPosition";
import { assertObjectLimit } from "../assertObjectLimit";
import { assertSurfacePosition } from "../assertSurfacePosition";
import { assertWallPosition } from "../assertWallPosition";
import { isWallCell } from "../isWallCell";
import { itemFootprint } from "../itemFootprint";
import { toFootprint } from "../toFootprint";

const layout = generateBlankLayout("XS", {
    floor: { tilesetId: "floor", tileCount: 4, tileIndex: 0 },
    wall: { tilesetId: "wall", tileCount: 2, tileIndex: 0, top: 1 },
});
const map: MapInfo = {
    id: "m",
    width: layout.width,
    height: layout.height,
    layout,
};

const item = (overrides: Partial<Item>): Item => ({
    rowId: "row",
    assetId: "asset",
    id: "asset",
    baseAssetId: null,
    rotation: null,
    colorKey: null,
    tileX: 5,
    tileY: 5,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    type: ASSET_TYPES.DESK,
    placement: ASSET_PLACEMENTS.GROUND,
    footprintW: 2,
    footprintH: 1,
    ...overrides,
});

describe("assertGroundPosition", () => {
    const desk = item({});

    it("accepts a free spot", () => {
        expect(() =>
            assertGroundPosition(
                toFootprint({ tileX: 10, tileY: 5 }, desk),
                map,
                [desk]
            )
        ).not.toThrow();
    });

    it("refuses a spot outside the map and one that is taken", () => {
        expect(() =>
            assertGroundPosition(
                toFootprint({ tileX: 99, tileY: 5 }, desk),
                map,
                []
            )
        ).toThrow(MapAssetOutOfBoundsError);
        expect(() =>
            assertGroundPosition(
                toFootprint({ tileX: 6, tileY: 5 }, desk),
                map,
                [desk]
            )
        ).toThrow(MapAssetPositionOccupiedError);
    });

    it("ignores objects that are not on the ground", () => {
        const monitor = item({
            placement: ASSET_PLACEMENTS.SURFACE,
            footprintW: 1,
        });

        expect(() =>
            assertGroundPosition(
                toFootprint({ tileX: 5, tileY: 5 }, desk),
                map,
                [monitor]
            )
        ).not.toThrow();
    });
});

describe("assertWallPosition", () => {
    const poster = item({ placement: ASSET_PLACEMENTS.WALL, footprintW: 1 });

    it("accepts the perimeter, where the blank map has walls", () => {
        expect(isWallCell(map, 0, 5)).toBe(true);
        expect(() =>
            assertWallPosition(toFootprint({ tileX: 0, tileY: 5 }, poster), map)
        ).not.toThrow();
    });

    it("refuses open floor and outside the map", () => {
        expect(isWallCell(map, 8, 8)).toBe(false);
        expect(() =>
            assertWallPosition(toFootprint({ tileX: 8, tileY: 8 }, poster), map)
        ).toThrow(MapAssetNotOnWallError);
        expect(() =>
            assertWallPosition(
                toFootprint({ tileX: 99, tileY: 8 }, poster),
                map
            )
        ).toThrow(MapAssetOutOfBoundsError);
    });
});

describe("assertSurfacePosition", () => {
    const desk = item({ rowId: "desk" });
    const monitor = item({
        rowId: "monitor",
        placement: ASSET_PLACEMENTS.SURFACE,
        type: ASSET_TYPES.MONITOR,
        footprintW: 1,
        parentId: "desk",
    });

    it("accepts a free cell of the desk top", () => {
        expect(() =>
            assertSurfacePosition(
                toFootprint({ tileX: 6, tileY: 5 }, monitor),
                desk,
                [monitor]
            )
        ).not.toThrow();
    });

    it("refuses an occupied cell, one off the desk, and a parent that is no desk", () => {
        expect(() =>
            assertSurfacePosition(itemFootprint(monitor), desk, [monitor])
        ).toThrow(MapAssetSurfaceOccupiedError);
        expect(() =>
            assertSurfacePosition(
                toFootprint({ tileX: 9, tileY: 5 }, monitor),
                desk,
                []
            )
        ).toThrow(MapAssetNotOnDeskTopError);
        expect(() =>
            assertSurfacePosition(
                toFootprint({ tileX: 5, tileY: 5 }, monitor),
                item({ type: ASSET_TYPES.TREE }),
                []
            )
        ).toThrow(MapAssetSurfaceRequiredError);
    });
});

describe("acceptsSurfaceItems and assertObjectLimit", () => {
    it("lets tables and desks carry items", () => {
        expect(acceptsSurfaceItems(ASSET_TYPES.DESK)).toBe(true);
        expect(acceptsSurfaceItems(ASSET_TYPES.TABLE)).toBe(true);
        expect(acceptsSurfaceItems(ASSET_TYPES.CHAIR)).toBe(false);
    });

    it("stops at the object limit of a map", () => {
        expect(() =>
            assertObjectLimit(MAX_OBJECTS_PER_MAP - 1, 1)
        ).not.toThrow();
        expect(() => assertObjectLimit(MAX_OBJECTS_PER_MAP, 1)).toThrow(
            MapAssetLimitExceededError
        );
    });
});

describe("positions with a footprint mask", () => {
    // The top arm and the left arm are occupied, the inside of the L is free.
    const corner = item({
        rowId: "corner",
        footprintW: 3,
        footprintH: 3,
        footprintMask: expandTileMask([
            [true, true, true],
            [true, false, false],
            [true, false, false],
        ]),
    });
    const chair = item({
        rowId: "chair",
        type: ASSET_TYPES.CHAIR,
        footprintW: 1,
        footprintH: 1,
    });
    const at = (tileX: number, tileY: number) =>
        itemFootprint({ ...chair, tileX, tileY });

    it("accepts a ground object in the free part of the L", () => {
        expect(() =>
            assertGroundPosition(at(6, 5), map, [corner])
        ).not.toThrow();
    });

    it("refuses a ground object over an occupied tile", () => {
        expect(() => assertGroundPosition(at(5, 5), map, [corner])).toThrow(
            MapAssetPositionOccupiedError
        );
    });

    it("refuses a surface item over a free tile of the parent", () => {
        const vase = item({
            rowId: "vase",
            type: ASSET_TYPES.PLANT,
            placement: ASSET_PLACEMENTS.SURFACE,
            footprintW: 1,
            footprintH: 1,
            parentId: "corner",
        });
        const onGap = itemFootprint({ ...vase, tileX: 6, tileY: 5 });
        const onArm = itemFootprint({ ...vase, tileX: 5, tileY: 4 });

        expect(() => assertSurfacePosition(onGap, corner, [])).toThrow(
            MapAssetNotOnDeskTopError
        );
        expect(() => assertSurfacePosition(onArm, corner, [])).not.toThrow();
    });
});
