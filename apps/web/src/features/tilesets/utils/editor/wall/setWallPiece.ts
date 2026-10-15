import {
    WALL_PIECE_EDGES,
    type TileMeta,
    type WallPiece,
} from "@standin/contracts";
import { DEFAULT_WALL_STYLE } from "../../../consts/wall";
import type { CanEditTile } from "../../../types/meta";
import { getWallTargets } from "./getWallTargets";

// Says which piece of a wall style the tiles are, by the edges they draw, or
// takes the edges away when the piece is null. A tile that has no style yet
// joins `fallbackStyle`, since a piece always belongs to a style.
export const setWallPiece = (
    meta: TileMeta,
    indices: number[],
    piece: WallPiece | null,
    canEdit: CanEditTile,
    fallbackStyle: string = DEFAULT_WALL_STYLE
): TileMeta => {
    const targets = getWallTargets(meta, indices, canEdit);
    if (targets.length === 0) return meta;

    const next = { ...meta };
    for (const index of targets) {
        const key = String(index);
        const { edges: _edges, ...rest } = meta[key];
        if (piece === null) {
            next[key] = rest;
            continue;
        }
        next[key] = {
            ...rest,
            style: rest.style ?? fallbackStyle,
            edges: [...WALL_PIECE_EDGES[piece]],
        };
    }
    return next;
};
