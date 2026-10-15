import { describe, expect, it } from "vitest";
import {
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    MapAssetModelTooSmallError,
    MapAssetParentNotAllowedError,
    MapAssetFloorNotAllowedError,
    MapAssetTargetDeskNotFoundError,
    generateBlankLayout,
} from "@standin/contracts";
import type { Item } from "../../types/item";
import type { MapInfo } from "../../types/map-info";
import { assertModelFitsChildren } from "../assertModelFitsChildren";
import { planGroundMove } from "../planGroundMove";
import { planSurfaceMove } from "../planSurfaceMove";
import { toFootprint } from "../toFootprint";

const layout = generateBlankLayout("XS", {
    floor: { tilesetId: "floor", tileCount: 4, tileIndex: 0 },
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

describe("planGroundMove", () => {
    const root = item({ rowId: "root" });
    const chair = item({
        rowId: "chair",
        type: ASSET_TYPES.CHAIR,
        footprintW: 1,
        tileY: 6,
        offsetX: 0,
        offsetY: 0,
        parentId: "root",
    });
    const base = { current: root, def: root, map, items: [root, chair] };

    it("moves a bundle root together with its children by the same delta", () => {
        const plan = planGroundMove({
            ...base,
            next: { tileX: 9, tileY: 5 },
            requestedParentId: undefined,
            children: [chair],
        });

        expect(plan.parentId).toBeNull();
        expect(plan.childChanges).toEqual([
            {
                id: "chair",
                tileX: 9,
                tileY: 6,
                offsetX: 0,
                offsetY: 0,
                parentId: "root",
            },
        ]);
    });

    it("detaches a bundle part that moves on its own", () => {
        const plan = planGroundMove({
            ...base,
            current: chair,
            def: chair,
            next: { tileX: 12, tileY: 6 },
            requestedParentId: undefined,
            children: [],
        });

        expect(plan).toEqual({ parentId: null, childChanges: [] });
    });

    it("keeps the link when the part does not move, and honors an explicit detach", () => {
        const stays = planGroundMove({
            ...base,
            current: chair,
            def: chair,
            next: { tileX: chair.tileX, tileY: chair.tileY },
            requestedParentId: undefined,
            children: [],
        });
        const detached = planGroundMove({
            ...base,
            current: chair,
            def: chair,
            next: { tileX: chair.tileX, tileY: chair.tileY },
            requestedParentId: null,
            children: [],
        });

        expect(stays.parentId).toBe("root");
        expect(detached.parentId).toBeNull();
    });

    it("refuses to attach a ground object to a parent", () => {
        expect(() =>
            planGroundMove({
                ...base,
                next: { tileX: 5, tileY: 5 },
                requestedParentId: "somewhere",
                children: [],
            })
        ).toThrow(MapAssetParentNotAllowedError);
    });
});

describe("planSurfaceMove", () => {
    const desk = item({ rowId: "desk" });
    const monitor = item({
        rowId: "monitor",
        placement: ASSET_PLACEMENTS.SURFACE,
        type: ASSET_TYPES.MONITOR,
        footprintW: 1,
        parentId: "desk",
    });

    it("keeps a surface item on a desk", () => {
        expect(() =>
            planSurfaceMove(
                monitor,
                toFootprint({ tileX: 6, tileY: 5 }, monitor),
                "desk",
                [desk, monitor]
            )
        ).not.toThrow();
    });

    it("refuses the floor and a desk that does not exist", () => {
        const footprint = toFootprint({ tileX: 5, tileY: 5 }, monitor);

        expect(() => planSurfaceMove(monitor, footprint, null, [desk])).toThrow(
            MapAssetFloorNotAllowedError
        );
        expect(() =>
            planSurfaceMove(monitor, footprint, "gone", [desk])
        ).toThrow(MapAssetTargetDeskNotFoundError);
    });
});

describe("assertModelFitsChildren", () => {
    const monitor = item({
        rowId: "monitor",
        placement: ASSET_PLACEMENTS.SURFACE,
        type: ASSET_TYPES.MONITOR,
        footprintW: 1,
        tileX: 6,
        parentId: "desk",
    });

    it("accepts a model that still holds the items on top", () => {
        const wider = item({ footprintW: 3 });

        expect(() =>
            assertModelFitsChildren(
                wider,
                toFootprint({ tileX: 5, tileY: 5 }, wider),
                [monitor]
            )
        ).not.toThrow();
    });

    it("refuses one that is smaller, or that takes no items", () => {
        const narrow = item({ footprintW: 1 });
        const tree = item({ type: ASSET_TYPES.TREE });

        expect(() =>
            assertModelFitsChildren(
                narrow,
                toFootprint({ tileX: 5, tileY: 5 }, narrow),
                [monitor]
            )
        ).toThrow(MapAssetModelTooSmallError);
        expect(() =>
            assertModelFitsChildren(
                tree,
                toFootprint({ tileX: 5, tileY: 5 }, tree),
                [monitor]
            )
        ).toThrow(MapAssetModelTooSmallError);
    });
});
