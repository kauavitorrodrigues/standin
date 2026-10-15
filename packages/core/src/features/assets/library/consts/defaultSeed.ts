import {
    ASSET_ACTIONS,
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    SEAT_FACINGS,
    TILE_CATEGORIES,
    TILE_SIZE,
} from "@standin/contracts";
import { buildColorSprite } from "../utils/buildColorSprite";
import { buildColorTileset } from "../utils/buildColorTileset";
import type { LibrarySeed } from "../../seed/types";
import {
    WALL_SHEET_IMAGE,
    WALL_SHEET_META,
} from "./defaultWallSheet";
import type { Rgba } from "../types";

export const DEFAULT_LIBRARY_KEYS = {
    FLOORS: "floors",
    WALLS: "walls",
} as const;

// Placeholder art so a fresh instance can create blank spaces and fill them.
// Real packs replace it (see `library.json` in the seed folder). Tiles and
// sprites are flat colors on a 32 px grid.
const FLOOR_COLORS: Rgba[] = [
    [196, 168, 130, 255],
    [170, 190, 150, 255],
    [150, 170, 200, 255],
    [210, 200, 190, 255],
];

const RED = { key: "red", hex: "#D64545" } as const;
const BLUE = { key: "blue", hex: "#3F6FD1" } as const;
const GREEN = { key: "green", hex: "#4CA36B" } as const;
const RED_RGBA: Rgba = [214, 69, 69, 255];
const BLUE_RGBA: Rgba = [63, 111, 209, 255];
const GREEN_RGBA: Rgba = [76, 163, 107, 255];
const WOOD_RGBA: Rgba = [152, 108, 70, 255];
const LEAF_RGBA: Rgba = [64, 140, 80, 255];
const SCREEN_RGBA: Rgba = [40, 48, 64, 255];

const TV_FRAME_COUNT = 3;
const TV_FRAME_DURATION_MS = 200;
const LOOP_FOREVER = -1;
const DESK_TILES = 2;
const PLANT_HEIGHT_TILES = 2;

export const DEFAULT_LIBRARY_SEED: LibrarySeed = {
    tilesets: [
        {
            key: DEFAULT_LIBRARY_KEYS.FLOORS,
            name: "Pisos",
            image: buildColorTileset(FLOOR_COLORS),
            tileMeta: {
                "0": { category: TILE_CATEGORIES.FLOOR, blankDefault: true },
                "1": { category: TILE_CATEGORIES.FLOOR },
                "2": { category: TILE_CATEGORIES.FLOOR },
                "3": { category: TILE_CATEGORIES.FLOOR },
            },
        },
        {
            key: DEFAULT_LIBRARY_KEYS.WALLS,
            name: "Paredes",
            image: WALL_SHEET_IMAGE,
            tileMeta: WALL_SHEET_META,
        },
    ],
    assets: [
        {
            key: "chair",
            name: "Cadeira",
            type: ASSET_TYPES.CHAIR,
            footprint: { w: 1, h: 1 },
            action: ASSET_ACTIONS.SIT,
            actionParams: {
                seats: [{ dx: 16, dy: 8, facing: SEAT_FACINGS.DOWN }],
            },
            color: RED,
            image: buildColorSprite(TILE_SIZE, TILE_SIZE, RED_RGBA),
            variants: [
                {
                    key: "chair-blue",
                    color: BLUE,
                    image: buildColorSprite(TILE_SIZE, TILE_SIZE, BLUE_RGBA),
                },
            ],
        },
        {
            key: "desk",
            name: "Mesa de trabalho",
            type: ASSET_TYPES.DESK,
            footprint: { w: DESK_TILES, h: 1 },
            image: buildColorSprite(
                TILE_SIZE * DESK_TILES,
                TILE_SIZE,
                WOOD_RGBA
            ),
        },
        {
            key: "mug",
            name: "Caneca",
            type: ASSET_TYPES.DECORATION,
            category: "FOOD_DRINK",
            placement: ASSET_PLACEMENTS.SURFACE,
            footprint: { w: 1, h: 1 },
            color: RED,
            image: buildColorSprite(TILE_SIZE, TILE_SIZE, RED_RGBA),
            variants: [
                {
                    key: "mug-blue",
                    color: BLUE,
                    image: buildColorSprite(TILE_SIZE, TILE_SIZE, BLUE_RGBA),
                },
                {
                    key: "mug-green",
                    color: GREEN,
                    image: buildColorSprite(TILE_SIZE, TILE_SIZE, GREEN_RGBA),
                },
            ],
        },
        {
            key: "plant",
            name: "Planta",
            type: ASSET_TYPES.PLANT,
            footprint: { w: 1, h: 1 },
            image: buildColorSprite(
                TILE_SIZE,
                TILE_SIZE * PLANT_HEIGHT_TILES,
                LEAF_RGBA
            ),
        },
        {
            key: "tv",
            name: "TV",
            type: ASSET_TYPES.TV,
            placement: ASSET_PLACEMENTS.WALL,
            footprint: { w: DESK_TILES, h: 1 },
            animation: {
                frameCount: TV_FRAME_COUNT,
                frameDurationMs: TV_FRAME_DURATION_MS,
                repeat: LOOP_FOREVER,
            },
            image: buildColorSprite(
                TILE_SIZE * DESK_TILES,
                TILE_SIZE,
                SCREEN_RGBA,
                TV_FRAME_COUNT
            ),
        },
    ],
};
