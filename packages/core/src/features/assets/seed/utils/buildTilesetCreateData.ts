import type { SeedTileset } from "../types";

/** The data of a new tileset. */
export const buildTilesetCreateData = (entry: SeedTileset) => ({
    key: entry.key,
    name: entry.name,
    margin: entry.margin,
    spacing: entry.spacing,
    tileMeta: entry.tileMeta,
});
