import { findDoorRoom, type EditorModel } from "@standin/contracts";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { getPlacedDoorRect } from "@/features/editor/utils/getPlacedDoorRect";

// The ids of the placed doors that belong to the room with this key.
export const getRoomDoorIds = (
    model: Readonly<EditorModel>,
    roomKey: string
): string[] => {
    const zones = getLayoutZones(model.layout);

    return model.placed
        .filter((placed) => {
            const rect = getPlacedDoorRect(model, placed);
            if (!rect) return false;

            const match = findDoorRoom(rect, zones);
            return match.status === "room" && match.roomKey === roomKey;
        })
        .map(({ id }) => id);
};
