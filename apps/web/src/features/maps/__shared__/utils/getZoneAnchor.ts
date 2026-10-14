import { TILE_SIZE } from "@standin/contracts";
import type { ScreenRect } from "@/features/maps/__shared__/types/screen-rect";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

type Params = {
    rect: ZoneRect;
    // The part of the world the camera shows, and its zoom.
    worldView: { x: number; y: number };
    zoom: number;
    // The canvas on the page, and how many game pixels fit in one page pixel.
    canvasBounds: { left: number; top: number };
    displayScale: { x: number; y: number };
};

// Where a rectangle of cells is on the screen, for something that opens over
// it.
export const getZoneAnchor = ({
    rect,
    worldView,
    zoom,
    canvasBounds,
    displayScale,
}: Params): ScreenRect => ({
    left:
        canvasBounds.left +
        ((rect.x * TILE_SIZE - worldView.x) * zoom) / displayScale.x,
    top:
        canvasBounds.top +
        ((rect.y * TILE_SIZE - worldView.y) * zoom) / displayScale.y,
    width: (rect.w * TILE_SIZE * zoom) / displayScale.x,
    height: (rect.h * TILE_SIZE * zoom) / displayScale.y,
});
