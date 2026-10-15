import { TILE_SIZE } from "../consts/constants";
import { TILED_LAYER_TYPES } from "../enums/tiled-layer-type";
import { SIZE_TIERS, type SizeTier } from "../consts/size-tiers";
import {
    LAYOUT_LAYER_NAMES,
    LAYOUT_ZONES_LAYER_NAME,
    LAYOUT_ZONE_KINDS,
    type MapLayout,
    type LayoutTileLayer,
} from "../schemas/layout.schema";
import { FIRST_GID } from "./consts/thresholds";
import type { BlankDefaults } from "./library";
import { zoneToObject } from "./zone";

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

/**
 * A blank map for a tier. Pure and deterministic. The caller checks that the
 * tier is enabled and that a default floor exists (see `BLANK_DEFAULT_*`).
 *
 * - `ground`: every cell with the default floor tile.
 * - `walls`: the perimeter, when a default wall exists. The same tile on every
 *   edge, no corner or edge variants (autotile is out of scope).
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

    if (wall) {
        const wallGid = firstGidOf(wall.tilesetId) + wall.tileIndex;
        const topGid =
            wall.top === undefined
                ? null
                : firstGidOf(wall.tilesetId) + wall.top;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const isPerimeter =
                    x === 0 || y === 0 || x === width - 1 || y === height - 1;
                if (!isPerimeter) continue;

                walls[y * width + x] = wallGid;
                if (topGid !== null && y > 0) {
                    foreground[(y - 1) * width + x] = topGid;
                }
            }
        }
    }

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

    return {
        orientation: "orthogonal",
        renderorder: "right-down",
        infinite: false,
        tilewidth: TILE_SIZE,
        tileheight: TILE_SIZE,
        width,
        height,
        nextlayerid: 6,
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
};
