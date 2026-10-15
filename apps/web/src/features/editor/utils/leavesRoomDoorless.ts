import {
    findDoorRoom,
    TILE_SIZE,
    type EditorModel,
    type Zone,
} from "@standin/contracts";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { getPlacedDoorRect } from "@/features/editor/utils/getPlacedDoorRect";
import { getRoomDoorIds } from "@/features/editor/utils/getRoomDoorIds";

type Params = {
    model: Readonly<EditorModel>;
    zone: Zone;
    rect: ZoneRect;
};

// True when moving or resizing this room to `rect` leaves a door of the room
// without a room of its own: it reaches no room, or more than one. Only a
// room (private zone) with doors can be affected.
export const leavesRoomDoorless = ({ model, zone, rect }: Params): boolean => {
    if (zone.kind !== ZONE_KINDS.ROOM) return false;
    if (zone.key === undefined) return false;

    const doorIds = getRoomDoorIds(model, zone.key);
    if (doorIds.length === 0) return false;

    const moved: Zone = {
        ...zone,
        polygon: undefined,
        x: rect.x * TILE_SIZE,
        y: rect.y * TILE_SIZE,
        width: rect.w * TILE_SIZE,
        height: rect.h * TILE_SIZE,
    };
    const zones = getLayoutZones(model.layout).map((other) =>
        other.id === zone.id ? moved : other
    );

    return model.placed
        .filter(({ id }) => doorIds.includes(id))
        .some((placed) => {
            const doorRect = getPlacedDoorRect(model, placed);
            if (!doorRect) return false;

            return findDoorRoom(doorRect, zones).status !== "room";
        });
};
