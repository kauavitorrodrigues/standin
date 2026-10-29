import {
    ALL_WALL_PIECES,
    getWallStyles,
    validateWallStyle,
} from "@standin/contracts";
import type { Tileset } from "@standin/contracts";
import { AUTHORING_ISSUE_CODES, createIssue } from "../../issues";
import type { RoomWalls, WallTileResult } from "../../types";

/**
 * The tile a room outline is painted with. A given tile index is used as it
 * is. A style name is looked up in the tile meta of the tileset, must have the
 * eight pieces, and gives the first tile of its first piece: the outline picks
 * the piece of each cell from its neighbors, so any tile of the style does.
 */
export const resolveWallTile = (
    tileset: Tileset,
    walls: RoomWalls
): WallTileResult => {
    if ("tileIndex" in walls) return { ok: true, tileIndex: walls.tileIndex };

    const path = `walls.style.${walls.style}`;
    const style = getWallStyles(tileset.tileMeta ?? {}).find(
        ({ name }) => name === walls.style
    );
    if (!style) {
        return {
            ok: false,
            issue: createIssue(
                AUTHORING_ISSUE_CODES.WALL_STYLE_NOT_FOUND,
                path,
                {
                    style: walls.style,
                }
            ),
        };
    }
    if (!validateWallStyle(style).isComplete) {
        return {
            ok: false,
            issue: createIssue(
                AUTHORING_ISSUE_CODES.WALL_STYLE_INCOMPLETE,
                path,
                {
                    style: walls.style,
                }
            ),
        };
    }

    const piece = ALL_WALL_PIECES.find(
        (candidate) => (style.pieces[candidate] ?? []).length > 0
    );
    return {
        ok: true,
        tileIndex: (piece && style.pieces[piece]?.[0]?.index) ?? 0,
    };
};
