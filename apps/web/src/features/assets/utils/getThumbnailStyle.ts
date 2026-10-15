import type { CSSProperties } from "react";
import type { LibraryFamilyThumbnail } from "@standin/contracts";

// Shows the first frame of an asset PNG scaled to fit a square box, without
// a canvas. The PNG of an animated asset is a strip, so the background is
// `frameCount` frames wide and only the first one is in view. `maxScale` caps
// the zoom, so 1 keeps small sprites at their natural size.
export const getThumbnailStyle = (
    thumbnail: LibraryFamilyThumbnail,
    url: string,
    box: number,
    maxScale = Infinity
): CSSProperties => {
    const { sprite, frameCount } = thumbnail;
    const scale = Math.min(box / Math.max(sprite.w, sprite.h), maxScale);
    return {
        width: sprite.w * scale,
        height: sprite.h * scale,
        backgroundImage: `url(${url})`,
        backgroundSize: `${sprite.w * frameCount * scale}px ${sprite.h * scale}px`,
        backgroundPosition: "0 0",
        imageRendering: "pixelated",
    };
};
