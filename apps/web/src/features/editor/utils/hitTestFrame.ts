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
};

// What a press at a world point grabs on the frame: the grip first, then a
// corner, then the edge the point is near, or null. The whole edge is a handle,
// not only its middle, because the frame is the thing being sized.
export const hitTestFrame = ({
    rect,
    worldX,
    worldY,
    zoom,
}: Params): FrameGrab | null => {
    const left = rect.x * TILE_SIZE;
    const top = rect.y * TILE_SIZE;
    const right = left + rect.w * TILE_SIZE;
    const bottom = top + rect.h * TILE_SIZE;
    const edge = EDITOR_FRAME.EDGE_REACH / zoom;
    const corner = EDITOR_FRAME.CORNER_REACH / zoom;
    const grip = EDITOR_FRAME.GRIP_SIZE / zoom;
    const inset = EDITOR_FRAME.GRIP_INSET / zoom;

    const onGrip =
        worldX >= left + inset &&
        worldX <= left + inset + grip &&
        worldY >= top + inset &&
        worldY <= top + inset + grip;
    if (onGrip) return "move";

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

    return null;
};
