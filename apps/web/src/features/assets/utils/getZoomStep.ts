import { ZOOMS, type Zoom } from "../consts/editorZoom";

// The zoom one step in or out from the current one, null at the ends.
export const getZoomStep = (zoom: Zoom, direction: 1 | -1): Zoom | null =>
    ZOOMS[ZOOMS.indexOf(zoom) + direction] ?? null;
