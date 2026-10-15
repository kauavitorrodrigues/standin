import type { ScreenRect } from "@/features/editor/types/screen-rect";

type Params = {
    // A rectangle in world pixels.
    rect: { x: number; y: number; width: number; height: number };
    // The part of the world the camera shows, and its zoom.
    worldView: { x: number; y: number };
    zoom: number;
    // The canvas on the page, and how many game pixels fit in one page pixel.
    canvasBounds: { left: number; top: number };
    displayScale: { x: number; y: number };
};

// Where a rectangle of the world is on the page, for the DOM that floats over
// it.
export const getWorldRectAnchor = ({
    rect,
    worldView,
    zoom,
    canvasBounds,
    displayScale,
}: Params): ScreenRect => ({
    left: canvasBounds.left + ((rect.x - worldView.x) * zoom) / displayScale.x,
    top: canvasBounds.top + ((rect.y - worldView.y) * zoom) / displayScale.y,
    width: (rect.width * zoom) / displayScale.x,
    height: (rect.height * zoom) / displayScale.y,
});
