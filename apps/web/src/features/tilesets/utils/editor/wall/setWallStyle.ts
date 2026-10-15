import { WALL_STYLE_NAME_MAX, type TileMeta } from "@standin/contracts";
import type { CanEditTile } from "../../../types/meta";
import { getWallTargets } from "./getWallTargets";

// Puts the tiles in the wall style with this name. A blank name takes them
// out of any style, and with it the edges, since a piece cannot be one
// without a style.
export const setWallStyle = (
    meta: TileMeta,
    indices: number[],
    name: string,
    canEdit: CanEditTile
): TileMeta => {
    const targets = getWallTargets(meta, indices, canEdit);
    if (targets.length === 0) return meta;

    const style = name.trim().slice(0, WALL_STYLE_NAME_MAX);
    const next = { ...meta };
    for (const index of targets) {
        const key = String(index);
        const { style: _style, edges, ...rest } = meta[key];
        if (style === "") {
            next[key] = rest;
            continue;
        }
        next[key] = edges ? { ...rest, style, edges } : { ...rest, style };
    }
    return next;
};
