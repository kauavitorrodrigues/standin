import type { CSSProperties } from "react";
import type { TileCutout } from "../../types/sheet";

// The background of a tile drawn bright over the shade: its own piece of the
// sheet. Nothing when it is not highlighted.
export const getTileCutoutStyle = (
    cutout: TileCutout | undefined
): CSSProperties => {
    if (!cutout) return {};
    return {
        backgroundImage: `url(${cutout.url})`,
        backgroundSize: `${cutout.widthPx * cutout.zoom}px ${cutout.heightPx * cutout.zoom}px`,
        backgroundPosition: `${-cutout.srcX * cutout.zoom}px ${-cutout.srcY * cutout.zoom}px`,
        imageRendering: "pixelated",
    };
};
