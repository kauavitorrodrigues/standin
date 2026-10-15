import type { TileMeta } from "@standin/contracts";
import type { CanEditTile } from "../../../types/meta";
import { canHaveWallMeta } from "../categoryRules";

// The tiles an edit of a wall piece reaches: the ones that are walls and that
// the tileset lets change.
export const getWallTargets = (
    meta: TileMeta,
    indices: number[],
    canEdit: CanEditTile
): number[] =>
    indices.filter((index) => {
        const entry = meta[String(index)];
        return entry && canHaveWallMeta(entry.category) && canEdit(index);
    });
