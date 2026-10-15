import { TILE_CATEGORIES } from "../../assets/enums/tile-category";
import { TILE_SIZE } from "../consts/constants";
import { TILED_LAYER_TYPES } from "../enums/tiled-layer-type";
import { SIZE_TIERS, type SizeTier } from "../consts/size-tiers";
import {
    LAYOUT_AREA_FLOOR_LAYER_NAME,
    LAYOUT_LAYER_NAMES,
    LAYOUT_ZONES_LAYER_NAME,
    LAYOUT_ZONE_KINDS,
    type MapLayout,
    type LayoutTileLayer,
} from "../schemas/layout.schema";
import { FIRST_GID } from "./consts/thresholds";
import type { BlankDefaults } from "./library";
import { zoneToObject } from "./zone";
import { applyPaint } from "./ops/applyPaint";
import type { LayoutLibrary } from "./library";
import type { BlankTile } from "./library";

const createTileLayer = (
    id: number,
    name: string,
    width: number,
    height: number,
    data: number[]
): LayoutTileLayer => ({
    id,
    type: TILED_LAYER_TYPES.TILE_LAYER,
    name,
    x: 0,
    y: 0,
    width,
    height,
    visible: true,
    opacity: 1,
    data,
});

// The cells of the border of the map.
const getPerimeterCells = (width: number, height: number): [number, number][] => {
    const cells: [number, number][] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const isPerimeter =
                x === 0 || y === 0 || x === width - 1 || y === height - 1;
            if (isPerimeter) cells.push([x, y]);
        }
    }
    return cells;
};

// Paints the border of the map with the default wall through the same
// operation the editor uses, so a wall style gets the piece each cell asks for
// (corners and sides) and a single tile wall keeps the same tile everywhere,
// with the top above it.
const paintPerimeter = (layout: MapLayout, wall: BlankTile): void => {
    const library: LayoutLibrary = {
        tilesets: {
            [wall.tilesetId]: {
                id: wall.tilesetId,
                organizationId: null,
                tileCount: wall.tileCount,
                tileMeta: wall.tileMeta ?? {
                    [String(wall.tileIndex)]: {
                        category: TILE_CATEGORIES.WALL,
                        ...(wall.top === undefined ? {} : { top: wall.top }),
                    },
                },
            },
        },
    };

    applyPaint(
        layout,
        {
            type: "paint",
            layer: LAYOUT_LAYER_NAMES.WALLS,
            tilesetId: wall.tilesetId,
            tileIndex: wall.tileIndex,
            cells: getPerimeterCells(layout.width, layout.height),
        },
        library
    );
};

/**
 * A blank map for a tier. Pure and deterministic. The caller checks that the
 * tier is enabled and that a default floor exists (see `BLANK_DEFAULT_*`).
 *
 * - `ground`: every cell with the default floor tile.
 * - `walls`: the perimeter, when a default wall exists. A wall style gets the
 *   corner and side pieces, a single tile wall the same tile on every edge.
 * - `foreground`: the wall `top` on the cell above each perimeter cell, when
 *   the wall has one and the row above is inside the map.
 * - `zones`: one spawn on the center cell.
 */
export const generateBlankLayout = (
    tier: SizeTier,
    defaults: BlankDefaults
): MapLayout => {
    const { maxWidth: width, maxHeight: height } = SIZE_TIERS[tier];
    const cellCount = width * height;
    const { floor, wall } = defaults;

    const tilesets = [{ name: floor.tilesetId, firstgid: FIRST_GID }];
    if (wall && wall.tilesetId !== floor.tilesetId) {
        tilesets.push({
            name: wall.tilesetId,
            firstgid: FIRST_GID + floor.tileCount,
        });
    }
    const firstGidOf = (tilesetId: string) =>
        tilesets.find((tileset) => tileset.name === tilesetId)!.firstgid;

    const ground = new Array<number>(cellCount).fill(
        firstGidOf(floor.tilesetId) + floor.tileIndex
    );
    const walls = new Array<number>(cellCount).fill(0);
    const foreground = new Array<number>(cellCount).fill(0);

    const spawn = zoneToObject(
        {
            kind: LAYOUT_ZONE_KINDS.SPAWN,
            x: Math.floor(width / 2) * TILE_SIZE,
            y: Math.floor(height / 2) * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
        },
        1
    );

    const layout: MapLayout = {
        orientation: "orthogonal",
        renderorder: "right-down",
        infinite: false,
        tilewidth: TILE_SIZE,
        tileheight: TILE_SIZE,
        width,
        height,
        nextlayerid: 7,
        nextobjectid: 2,
        tilesets,
        layers: [
            createTileLayer(
                1,
                LAYOUT_LAYER_NAMES.GROUND,
                width,
                height,
                ground
            ),
            createTileLayer(
                6,
                LAYOUT_AREA_FLOOR_LAYER_NAME,
                width,
                height,
                new Array<number>(cellCount).fill(0)
            ),
            createTileLayer(2, LAYOUT_LAYER_NAMES.WALLS, width, height, walls),
            createTileLayer(
                3,
                LAYOUT_LAYER_NAMES.FURNITURE,
                width,
                height,
                new Array<number>(cellCount).fill(0)
            ),
            createTileLayer(
                4,
                LAYOUT_LAYER_NAMES.FOREGROUND,
                width,
                height,
                foreground
            ),
            {
                id: 5,
                type: TILED_LAYER_TYPES.OBJECT_GROUP,
                name: LAYOUT_ZONES_LAYER_NAME,
                x: 0,
                y: 0,
                visible: true,
                opacity: 1,
                objects: [spawn],
            },
        ],
    };

    if (wall) paintPerimeter(layout, wall);

    return layout;
};
