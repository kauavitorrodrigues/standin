import { TILE_CATEGORIES } from "../../assets/enums/tile-category";
import type { TileMeta } from "../../assets/schemas/tile-meta.schema";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "./consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "./issues";
import type { BlankDefaults, BlankTile } from "./library";

export type BlankDefaultTileset = {
    id: string;
    tileCount: number;
    tileMeta: TileMeta | null;
};

export type BlankDefaultsResult = {
    defaults: BlankDefaults | null;
    errors: LayoutIssue[];
};

const findMarked = (
    tilesets: BlankDefaultTileset[],
    category: string
): BlankTile[] =>
    tilesets.flatMap((tileset) =>
        Object.entries(tileset.tileMeta ?? {})
            .filter(
                ([, tile]) => tile.category === category && tile.blankDefault
            )
            .map(([tileIndex, tile]) => ({
                tilesetId: tileset.id,
                tileCount: tileset.tileCount,
                tileIndex: Number(tileIndex),
                top: tile.top,
                tileMeta: tileset.tileMeta,
            }))
    );

/**
 * Picks the floor and wall the blank map is built from, among the global
 * tilesets. The floor is required. More than one marked tile of the same
 * category is an error (also checked by the seed).
 */
export const resolveBlankDefaults = (
    globalTilesets: BlankDefaultTileset[]
): BlankDefaultsResult => {
    const errors: LayoutIssue[] = [];
    const floors = findMarked(globalTilesets, TILE_CATEGORIES.FLOOR);
    const walls = findMarked(globalTilesets, TILE_CATEGORIES.WALL);

    if (floors.length === 0) {
        errors.push(
            createIssue(
                Code.BLANK_DEFAULT_FLOOR_MISSING,
                "blankDefault",
                Messages.blankDefaultFloorMissing
            )
        );
    }
    if (floors.length > 1 || walls.length > 1) {
        errors.push(
            createIssue(
                Code.BLANK_DEFAULT_DUPLICATED,
                "blankDefault",
                Messages.blankDefaultDuplicated
            )
        );
    }

    if (errors.length > 0) return { defaults: null, errors };

    return { defaults: { floor: floors[0], wall: walls[0] }, errors };
};
