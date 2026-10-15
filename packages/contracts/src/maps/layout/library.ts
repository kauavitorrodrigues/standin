import type { TileMeta } from "../../assets/schemas/tile-meta.schema";

// What the pure layout functions need to know about the asset library. The
// server decides which tilesets go in: the global ones plus the map owner's,
// and any tileset the layout already uses.
export type LayoutLibraryTileset = {
    id: string;
    // Null for a global tileset.
    organizationId: string | null;
    tileCount: number;
    tileMeta: TileMeta | null;
};

export type LayoutLibrary = {
    tilesets: Record<string, LayoutLibraryTileset>;
};

export type BlankTile = {
    tilesetId: string;
    tileCount: number;
    tileIndex: number;
    // Local index of the top tile drawn above a wall tile.
    top?: number;
    // The tile meta of the tileset, which a wall style needs to pick pieces.
    tileMeta?: TileMeta | null;
};

export type BlankDefaults = {
    floor: BlankTile;
    wall?: BlankTile;
};
