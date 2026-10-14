import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "@standin/contracts";
import type { FrameLimits } from "@/features/editor/types/frame-limits";
import type { TileRect } from "@/features/editor/types/tile-rect";

// The composer always opens on a canvas of the largest size an area can have.
// The size of the area is the frame the admin drags inside it.
export const AREA_CANVAS = {
    width: STAMP_MAX_WIDTH,
    height: STAMP_MAX_HEIGHT,
} as const;

// Where the frame of a new area starts: 12 x 8, on the top left corner.
export const AREA_FRAME_INITIAL: TileRect = { x: 0, y: 0, w: 12, h: 8 };

export const AREA_FRAME_LIMITS: FrameLimits = {
    minSize: STAMP_MIN_SIZE,
    maxWidth: STAMP_MAX_WIDTH,
    maxHeight: STAMP_MAX_HEIGHT,
};

// The id the composer gives its map, which has none in the database.
export const AREA_COMPOSER_MAP_ID = "area-composer";

export const AREA_LIST_PATH = "/admin/areas";
