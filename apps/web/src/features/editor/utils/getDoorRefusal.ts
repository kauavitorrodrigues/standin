import {
    ASSET_TYPES,
    findDoorRoom,
    TILE_SIZE,
    type AssetDefinition,
    type EditorModel,
    type Zone,
} from "@standin/contracts";
import { DOOR_PLACEMENT_REASONS } from "@/features/editor/consts/door-reasons";
import type { PlacementReason } from "@/features/editor/types/PlacementReason";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";

// The rooms a door is read against when the model does not carry them.
export type DoorRooms = readonly Zone[];

type Spot = {
    tileX: number;
    tileY: number;
    offsetX: number;
    offsetY: number;
};

// Why a door reaches no room. In the composer the rooms are given, and an
// empty list means the area is not a room at all.
const getNoRoomReason = (rooms?: DoorRooms): PlacementReason =>
    rooms?.length === 0
        ? DOOR_PLACEMENT_REASONS.AREA_NOT_ROOM
        : DOOR_PLACEMENT_REASONS.OUTSIDE_ROOM;

// Why a door cannot stand here, or null when it can (or is not a door). A
// door belongs on the border of exactly one `private` zone of the map.
export const getDoorRefusal = (
    model: Readonly<EditorModel>,
    asset: AssetDefinition,
    spot: Spot,
    rooms?: DoorRooms
): PlacementReason | null => {
    if (asset.type !== ASSET_TYPES.DOOR) return null;

    const width = asset.footprint.w * TILE_SIZE;
    const height = asset.footprint.h * TILE_SIZE;
    const match = findDoorRoom(
        {
            x: spot.tileX * TILE_SIZE + spot.offsetX,
            y: (spot.tileY + 1) * TILE_SIZE + spot.offsetY - height,
            width,
            height,
        },
        rooms ?? getLayoutZones(model.layout)
    );

    switch (match.status) {
        case "room":
            return null;
        case "ambiguous":
            return DOOR_PLACEMENT_REASONS.AMBIGUOUS_ROOM;
        case "none":
            return getNoRoomReason(rooms);
    }
};
