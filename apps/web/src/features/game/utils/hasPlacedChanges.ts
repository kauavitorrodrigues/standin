import type { PlacedDiff } from "@/features/game/types/placed-diff";

export const hasPlacedChanges = (diff: PlacedDiff): boolean =>
    diff.added.length > 0 ||
    diff.moved.length > 0 ||
    diff.replaced.length > 0 ||
    diff.removed.length > 0;
