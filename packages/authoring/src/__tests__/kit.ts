import {
    WALL_PIECES,
    WALL_PIECE_EDGES,
    buildBlankEditorModel,
} from "@standin/contracts";
import type {
    AssetDefinition,
    LibraryPalette,
    Tileset,
    WallPiece,
} from "@standin/contracts";

const PIECE_ORDER: WallPiece[] = [
    WALL_PIECES.N,
    WALL_PIECES.NE,
    WALL_PIECES.E,
    WALL_PIECES.SE,
    WALL_PIECES.S,
    WALL_PIECES.SW,
    WALL_PIECES.W,
    WALL_PIECES.NW,
];
const FACADES: WallPiece[] = [
    WALL_PIECES.N,
    WALL_PIECES.NE,
    WALL_PIECES.SE,
    WALL_PIECES.S,
    WALL_PIECES.SW,
    WALL_PIECES.NW,
];
const TOP_INDEX = 8;

const wallMeta = (style: string, skip: WallPiece[] = []) =>
    Object.fromEntries(
        PIECE_ORDER.flatMap((piece, index) =>
            skip.includes(piece)
                ? []
                : [
                      [
                          String(index),
                          {
                              category: "WALL" as const,
                              style,
                              edges: [...WALL_PIECE_EDGES[piece]],
                              ...(FACADES.includes(piece)
                                  ? { top: TOP_INDEX }
                                  : {}),
                          },
                      ],
                  ]
        )
    );

const tileset = (
    id: string,
    name: string,
    tileCount: number,
    tileMeta: Tileset["tileMeta"]
): Tileset => ({
    id,
    name,
    url: `/${id}.png`,
    widthPx: tileCount * 32,
    heightPx: 32,
    columns: tileCount,
    tileCount,
    margin: 0,
    spacing: 0,
    tileMeta,
});

export const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "asset",
        key: "asset",
        name: "Asset",
        type: "DECORATION",
        category: "ROOM_DECOR",
        baseAssetId: null,
        rotation: null,
        colorKey: null,
        colorHex: null,
        url: "/asset.png",
        sprite: { w: 32, h: 32 },
        footprint: { w: 1, h: 1, offsetX: 0 },
        placement: "GROUND",
        surfaceHeightPx: 0,
        solid: false,
        action: null,
        actionParams: null,
        promptText: null,
        animation: null,
        ...overrides,
    }) as AssetDefinition;

const door = (
    side: string,
    rotation: AssetDefinition["rotation"],
    w: number,
    h: number
) =>
    asset({
        id: `door-${side}`,
        key: `door-${side}`,
        type: "DOOR",
        baseAssetId: side === "n" ? null : "door-n",
        rotation,
        footprint: { w, h, offsetX: 0 },
    });

export const assets: AssetDefinition[] = [
    asset({ id: "crate", key: "crate" }),
    asset({
        id: "desk",
        key: "desk",
        type: "DESK",
        footprint: { w: 2, h: 1, offsetX: 0 },
    }),
    asset({ id: "chair", key: "chair", type: "CHAIR" }),
    asset({
        id: "monitor",
        key: "monitor",
        type: "MONITOR",
        placement: "SURFACE",
    }),
    door("n", "DEG_0", 2, 1),
    door("e", "DEG_90", 1, 2),
    door("s", "DEG_180", 2, 1),
    door("w", "DEG_270", 1, 2),
];

export const buildLibrary = (): LibraryPalette => ({
    tilesets: [
        tileset("ts-floor", "floor", 4, {
            "0": { category: "FLOOR" },
            "1": { category: "FLOOR" },
        }),
        tileset("ts-brick", "brick", 9, wallMeta("Brick")),
        tileset("ts-broken", "broken", 9, wallMeta("Broken", ["n"])),
    ],
    assets,
    categories: [],
    areas: [],
});

export const buildModel = (width = 30, height = 20) =>
    buildBlankEditorModel({ width, height, library: buildLibrary() });

export const ROOM = {
    key: "office",
    label: "Office",
    x: 4,
    y: 4,
    width: 10,
    height: 8,
    walls: { tileset: "brick", style: "Brick" },
    floor: { tileset: "floor", tileIndex: 0 },
} as const;
