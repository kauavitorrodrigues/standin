import {
    getWallPiece,
    getWallStyles,
    type TileMeta,
    type WallPiece,
    type WallStyle,
} from "@standin/contracts";
import { canHaveWallMeta } from "../categoryRules";

export type WallSelection = {
    // The selected tiles that are walls.
    walls: number[];
    // The only selected tile, when it is a wall.
    single: number | null;
    // The piece of that tile, null when it has no valid set of edges yet.
    piece: WallPiece | null;
    style: string;
    // Every wall style of the tileset, so the panel can offer them.
    styles: WallStyle[];
};

// What the wall panel needs to know about the selection.
export const getWallSelection = (
    meta: TileMeta,
    selected: number[]
): WallSelection => {
    const walls = selected.filter((index) => {
        const entry = meta[String(index)];
        return entry !== undefined && canHaveWallMeta(entry.category);
    });
    const only = walls.length === 1 && selected.length === 1 ? walls[0] : null;
    const entry = only === null ? undefined : meta[String(only)];

    return {
        walls,
        single: only,
        piece: entry?.edges ? getWallPiece(entry.edges) : null,
        style: entry?.style ?? "",
        styles: getWallStyles(meta),
    };
};
