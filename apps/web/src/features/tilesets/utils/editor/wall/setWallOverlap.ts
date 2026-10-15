import { WALL_OVERLAP_MAX, type TileMeta } from "@standin/contracts";
import type { CanEditTile } from "../../../types/meta";
import { getWallTargets } from "./getWallTargets";

// How many rows of the tile, from the top, draw over an avatar behind the
// wall, or none when the rows are null. It stays inside the tile.
export const setWallOverlap = (
    meta: TileMeta,
    indices: number[],
    rows: number | null,
    canEdit: CanEditTile
): TileMeta => {
    const targets = getWallTargets(meta, indices, canEdit);
    if (targets.length === 0) return meta;

    const next = { ...meta };
    for (const index of targets) {
        const key = String(index);
        const { overlap: _overlap, ...rest } = meta[key];
        if (rows === null) {
            next[key] = rest;
            continue;
        }
        const clamped = Math.min(
            WALL_OVERLAP_MAX,
            Math.max(0, Math.round(rows))
        );
        next[key] = { ...rest, overlap: clamped };
    }
    return next;
};
