export const TILESET_KINDS = {
    SHEET: "sheet",
    WALL: "wall",
} as const;

export type TilesetKind = (typeof TILESET_KINDS)[keyof typeof TILESET_KINDS];
