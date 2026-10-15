import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../assets/types";
import type { LibraryPalette } from "../../../assets/types/library";
import { TILE_SIZE } from "../../consts/constants";
import type { EditorModel } from "../../editor/types/editor-model";
import { validateDoors } from "../../editor/utils/validateDoors";
import { LAYOUT_ZONE_KINDS, type MapLayout } from "../../schemas/layout.schema";
import { applyOp } from "../applyOp";
import { findDoorSlots, type DoorSide } from "../findDoorSlots";
import { generateBlankLayout } from "../generateBlankLayout";
import { findTileLayer } from "../ops/findTileLayer";
import { findZonesGroup } from "../ops/findZonesGroup";
import { cellKey, readWallCells } from "../readWallCells";
import { zoneToObject, type Zone } from "../zone";
import { defaults } from "./fixtures";
import { THIN_ID, buildLibrary } from "./thinWallKit";

const library = buildLibrary();

// The room spans columns 3 to 8 and rows 3 to 6, and its wall is the outline
// of the same cells, the way "build the walls of a room" draws it.
const ROOM_COLUMNS = 6;
const ROOM_ROWS = 4;
const room: Zone = {
    kind: LAYOUT_ZONE_KINDS.PRIVATE,
    key: "a",
    label: "A",
    x: 3 * TILE_SIZE,
    y: 3 * TILE_SIZE,
    width: ROOM_COLUMNS * TILE_SIZE,
    height: ROOM_ROWS * TILE_SIZE,
};

const outline = (): [number, number][] => {
    const cells: [number, number][] = [];
    for (let x = 3; x <= 8; x++) {
        for (let y = 3; y <= 6; y++) {
            if (x === 3 || x === 8 || y === 3 || y === 6) cells.push([x, y]);
        }
    }
    return cells;
};

const drawRoom = (): MapLayout => {
    const blank = generateBlankLayout("XS", { floor: defaults.floor });
    const { layout, errors } = applyOp(
        blank,
        {
            type: "paint",
            layer: "walls",
            tilesetId: THIN_ID,
            tileIndex: 4,
            cells: outline(),
        },
        library
    );
    expect(errors).toEqual([]);
    return layout;
};

const SIZES: Record<DoorSide, { w: number; h: number }> = {
    north: { w: 2, h: 1 },
    south: { w: 2, h: 1 },
    east: { w: 1, h: 2 },
    west: { w: 1, h: 2 },
};

const slots = (layout: MapLayout) =>
    findDoorSlots({
        zones: [room],
        wallCells: readWallCells(layout),
        sizeBySide: SIZES,
        mapColumns: layout.width,
        mapRows: layout.height,
    });

const erase = (layout: MapLayout, cells: [number, number][]): MapLayout =>
    applyOp(layout, { type: "erase", layer: "walls", cells }, library).layout;

describe("door slots on an outline of thin walls", () => {
    it("reads every piece of the outline as a wall cell", () => {
        const walls = readWallCells(drawRoom());

        expect(walls.size).toBe(outline().length);
        expect(walls.has(cellKey(3, 3))).toBe(true);
        expect(walls.has(cellKey(5, 4))).toBe(false);
    });

    it("does not count the facade tops on the foreground as walls", () => {
        const layout = drawRoom();
        const foreground = findTileLayer(layout, "foreground");
        const tops = foreground?.data.filter((gid) => gid > 0).length ?? 0;

        expect(tops).toBeGreaterThan(0);
        expect(readWallCells(layout).has(cellKey(5, 2))).toBe(false);
    });

    it("finds no slot while the outline is closed", () => {
        expect(slots(drawRoom())).toEqual([]);
    });

    it("finds the gap an erase opens in the right wall", () => {
        const layout = erase(drawRoom(), [
            [8, 4],
            [8, 5],
        ]);

        expect(slots(layout)).toEqual([
            {
                roomKey: "a",
                side: "east",
                tileX: 8,
                tileY: 5,
                width: 1,
                height: 2,
            },
        ]);
    });

    it("finds a gap in the back wall, bounded by the corners", () => {
        const layout = erase(drawRoom(), [
            [5, 3],
            [6, 3],
        ]);

        expect(slots(layout)).toEqual([
            {
                roomKey: "a",
                side: "north",
                tileX: 5,
                tileY: 3,
                width: 2,
                height: 1,
            },
        ]);
    });

    it("keeps the neighbors of a gap as walls, so the corners still bound it", () => {
        const layout = erase(drawRoom(), [
            [5, 3],
            [6, 3],
        ]);
        const walls = readWallCells(layout);

        expect(walls.has(cellKey(4, 3))).toBe(true);
        expect(walls.has(cellKey(7, 3))).toBe(true);
        expect(walls.has(cellKey(5, 3))).toBe(false);
    });
});

describe("doors of a room of thin walls", () => {
    const door = {
        id: "door",
        type: "DOOR",
        placement: "GROUND",
        footprint: { w: 1, h: 2, offsetX: 0 },
    } as AssetDefinition;

    const buildModel = (
        layout: MapLayout,
        tileX: number,
        tileY: number
    ): EditorModel => {
        const group = findZonesGroup(layout);
        if (!group) throw new Error("no zones layer");
        group.objects = [zoneToObject(room, 1)];

        return {
            mapId: "map-1",
            width: layout.width,
            height: layout.height,
            layout,
            placed: [
                {
                    id: "p1",
                    assetId: "door",
                    tileX,
                    tileY,
                    offsetX: 0,
                    offsetY: 0,
                    parentId: null,
                    propertyOverrides: null,
                },
            ],
            library: {
                tilesets: [],
                assets: [door],
                categories: [],
                areas: [],
            } as unknown as LibraryPalette,
            desks: [],
            limits: { objectsUsed: 0, objectsMax: 100 },
            version: 1,
        };
    };

    it("accepts a door in the gap of the right wall", () => {
        const layout = erase(drawRoom(), [
            [8, 4],
            [8, 5],
        ]);

        expect(validateDoors(buildModel(layout, 8, 5))).toEqual([]);
    });

    it("refuses a door far from the room", () => {
        const layout = erase(drawRoom(), [
            [8, 4],
            [8, 5],
        ]);

        expect(validateDoors(buildModel(layout, 20, 20))).toHaveLength(1);
    });
});
