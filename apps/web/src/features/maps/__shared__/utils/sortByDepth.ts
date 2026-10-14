import type { ThumbnailDrawable } from "@/features/maps/__shared__/types/thumbnail";

// Back to front, as the scene draws them. The sort is stable, so objects at the
// same depth keep the order they were given.
export const sortByDepth = (
    drawables: readonly ThumbnailDrawable[]
): ThumbnailDrawable[] => [...drawables].sort((a, b) => a.depth - b.depth);
