import { ZOOM_LEVELS, type ZoomLevel } from "@standin/contracts";
import type { EditorZoomDirection } from "@/features/maps/__shared__/consts/camera";
import { getNextStep } from "@/utils/getNextStep";

// The level after this one in the given direction, or the same level at the
// ends of the list. The zoom may sit between two levels.
export const getNextZoom = (
    current: ZoomLevel,
    direction: EditorZoomDirection
): ZoomLevel => getNextStep(ZOOM_LEVELS, current, direction);
