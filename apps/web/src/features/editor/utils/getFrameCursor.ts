import { FRAME_CURSORS } from "@/features/editor/consts/frame";
import { ZONE_HANDLES } from "@/features/editor/consts/zone-handles";
import type { FrameGrab } from "@/features/editor/types/frame-grab";

// The mouse cursor that tells what a press would do.
export const getFrameCursor = (grab: FrameGrab | null): string => {
    switch (grab) {
        case null:
            return FRAME_CURSORS.DEFAULT;
        case "move":
            return FRAME_CURSORS.MOVE;
        case ZONE_HANDLES.NORTH:
        case ZONE_HANDLES.SOUTH:
            return FRAME_CURSORS.NORTH_SOUTH;
        case ZONE_HANDLES.EAST:
        case ZONE_HANDLES.WEST:
            return FRAME_CURSORS.EAST_WEST;
        case ZONE_HANDLES.NORTH_WEST:
        case ZONE_HANDLES.SOUTH_EAST:
            return FRAME_CURSORS.NORTH_WEST_SOUTH_EAST;
        case ZONE_HANDLES.NORTH_EAST:
        case ZONE_HANDLES.SOUTH_WEST:
            return FRAME_CURSORS.NORTH_EAST_SOUTH_WEST;
    }
};
