import { EDITOR_THUMBNAIL } from "@/features/maps/__shared__/consts/thumbnail";
import type { ThumbnailSize } from "@/features/maps/__shared__/types/thumbnail";

// Size of the photo for a map of `width` by `height` pixels: the same
// proportion, with the longest side at the ceiling. Small maps are scaled up
// too, so every photo has the same weight in the list.
export const getThumbnailSize = ({
    width,
    height,
}: ThumbnailSize): ThumbnailSize => {
    const scale = EDITOR_THUMBNAIL.MAX_SIDE / Math.max(width, height);

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
};
