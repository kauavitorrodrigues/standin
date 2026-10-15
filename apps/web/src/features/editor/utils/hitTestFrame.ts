import { TILE_SIZE } from "@standin/contracts";
import { EDITOR_FRAME } from "@/features/editor/consts/frame";
import { ZONE_HANDLES } from "@/features/editor/consts/zone-handles";
import type { FrameGrab } from "@/features/editor/types/frame-grab";
import type { TileRect } from "@/features/editor/types/tile-rect";

type Params = {
    rect: TileRect;
    worldX: number;
    worldY: number;
    // The camera zoom, so the reach stays the same on the screen.
    zoom: number;
    // Whether a press inside the frame, away from its edges, moves it.
    body: boolean;
};

// What a press at a world point grabs on the frame: a corner first, then the
// edge the point is near, then the inside when `body` is on, or null. The whole
// edge is a handle, not only its middle, because the frame is the thing being
// sized.
export const hitTestFrame = ({
    rect,
    worldX,
    worldY,
    zoom,
    body,
}: Params): FrameGrab | null => {
    const left = rect.x * TILE_SIZE;
    const top = rect.y * TILE_SIZE;
    const right = left + rect.w * TILE_SIZE;
    const bottom = top + rect.h * TILE_SIZE;
    const edge = EDITOR_FRAME.EDGE_REACH / zoom;
    const corner = EDITOR_FRAME.CORNER_REACH / zoom;
    const nearLeft = Math.abs(worldX - left) <= corner;
    const nearRight = Math.abs(worldX - right) <= corner;
    const nearTop = Math.abs(worldY - top) <= corner;
    const nearBottom = Math.abs(worldY - bottom) <= corner;

    if (nearTop && nearLeft) return ZONE_HANDLES.NORTH_WEST;
    if (nearTop && nearRight) return ZONE_HANDLES.NORTH_EAST;
    if (nearBottom && nearRight) return ZONE_HANDLES.SOUTH_EAST;
    if (nearBottom && nearLeft) return ZONE_HANDLES.SOUTH_WEST;

    const withinX = worldX >= left - edge && worldX <= right + edge;
    const withinY = worldY >= top - edge && worldY <= bottom + edge;
    if (withinX && Math.abs(worldY - top) <= edge) return ZONE_HANDLES.NORTH;
    if (withinX && Math.abs(worldY - bottom) <= edge) return ZONE_HANDLES.SOUTH;
    if (withinY && Math.abs(worldX - left) <= edge) return ZONE_HANDLES.WEST;
    if (withinY && Math.abs(worldX - right) <= edge) return ZONE_HANDLES.EAST;

    const inside =
        worldX >= left && worldX <= right && worldY >= top && worldY <= bottom;
    if (body && inside) return "move";

    return null;
};
