import {
    SOLID_MASK_SUBDIVISION,
    WALL_TILE_PROPERTIES,
    type TileMeta,
} from "@standin/contracts";
import type { WallTileMeta } from "@/features/game/types/wall-tile";

// A wall tile with nothing set blocks nothing and covers nothing, which is how
// a plain wall tile of an older tileset reads.
export const PLAIN_WALL_TILE: WallTileMeta = {
    solid: false,
    solidMask: null,
    overlap: 0,
    top: null,
};

const isMaskFitting = (value: unknown): value is boolean[][] =>
    Array.isArray(value) &&
    value.length === SOLID_MASK_SUBDIVISION &&
    value.every(
        (row) =>
            Array.isArray(row) &&
            row.length === SOLID_MASK_SUBDIVISION &&
            row.every((cell) => typeof cell === "boolean")
    );

const parseMask = (value: unknown): boolean[][] | null => {
    if (typeof value !== "string") return null;
    try {
        const parsed: unknown = JSON.parse(value);
        return isMaskFitting(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

const toCount = (value: unknown): number =>
    typeof value === "number" && Number.isInteger(value) && value > 0
        ? value
        : 0;

// The meta of a wall tile from the properties Phaser read from the tileset.
// Anything missing or malformed reads as not set.
export const parseWallTileProperties = (
    properties: Readonly<Record<string, unknown>> | undefined
): WallTileMeta => {
    if (!properties) return PLAIN_WALL_TILE;
    const top = properties[WALL_TILE_PROPERTIES.TOP];

    return {
        solid: properties[WALL_TILE_PROPERTIES.SOLID] === true,
        solidMask: parseMask(properties[WALL_TILE_PROPERTIES.SOLID_MASK]),
        overlap: toCount(properties[WALL_TILE_PROPERTIES.OVERLAP]),
        top: typeof top === "number" && Number.isInteger(top) ? top : null,
    };
};

// The same meta from the tile meta of the library, which is what the editor
// has instead of the properties of a tileset.
export const toWallTileMeta = (
    entry: TileMeta[string] | undefined
): WallTileMeta => {
    if (!entry) return PLAIN_WALL_TILE;

    return {
        solid: entry.solid === true,
        solidMask: entry.solidMask ?? null,
        overlap: entry.overlap ?? 0,
        top: entry.top ?? null,
    };
};
