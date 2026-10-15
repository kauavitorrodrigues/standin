import type { PlacedAsset } from "@standin/contracts";
import type { PlacedDiff } from "@/features/game/types/placed-diff";

// The pixel offset counts as a move: a free drag inside the same tile only
// changes it, and the sprite and the solid body must follow.
const hasMoved = (previous: PlacedAsset, next: PlacedAsset): boolean =>
    previous.tileX !== next.tileX ||
    previous.tileY !== next.tileY ||
    previous.offsetX !== next.offsetX ||
    previous.offsetY !== next.offsetY ||
    previous.parentId !== next.parentId;

/**
 * What it takes to turn the objects already drawn into the next list. A change
 * of asset wins over a move, because the sprite has to be rebuilt anyway.
 * Changes that do not show on screen, such as property overrides, are not in
 * the diff.
 */
export const diffPlaced = (
    previous: readonly PlacedAsset[],
    next: readonly PlacedAsset[]
): PlacedDiff => {
    const previousById = new Map(previous.map((item) => [item.id, item]));
    const nextIds = new Set(next.map((item) => item.id));
    const diff: PlacedDiff = {
        added: [],
        moved: [],
        replaced: [],
        removed: [],
    };

    for (const item of next) {
        const before = previousById.get(item.id);
        if (!before) {
            diff.added.push(item);
            continue;
        }
        if (before.assetId !== item.assetId) {
            diff.replaced.push(item);
            continue;
        }
        if (hasMoved(before, item)) diff.moved.push(item);
    }

    for (const item of previous) {
        if (!nextIds.has(item.id)) diff.removed.push(item.id);
    }

    return diff;
};
