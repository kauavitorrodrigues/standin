import { TILE_SIZE } from "../../consts/constants";
import type { Zone } from "../../layout/zone";
import { LAYOUT_ZONE_KINDS } from "../../schemas/layout.schema";
import type { StampRect } from "../types/stamp-rect";

// The key of the room a stamp stands for while it is only a stamp. It never
// reaches a map, placing the stamp makes a key of its own.
export const STAMP_ROOM_KEY = "stamp-room";

/**
 * The zone a room stamp would create on `rect`, in pixels. The door rule
 * reads it to know where the border of the room is before the stamp is on a
 * map.
 */
export const buildStampRoomZone = (rect: StampRect): Zone => ({
    kind: LAYOUT_ZONE_KINDS.PRIVATE,
    key: STAMP_ROOM_KEY,
    x: rect.x * TILE_SIZE,
    y: rect.y * TILE_SIZE,
    width: rect.w * TILE_SIZE,
    height: rect.h * TILE_SIZE,
});
