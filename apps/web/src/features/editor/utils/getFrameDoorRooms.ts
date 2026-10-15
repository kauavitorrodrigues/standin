import { buildStampRoomZone, type Zone } from "@standin/contracts";
import type { FrameConfig } from "@/features/editor/types/FrameConfig";

// The rooms the door rule reads inside the frame of an area. The area stands
// for a single room that fills the frame, or for none when it is not a room.
// Null when there is no frame, so the zones of the model count.
export const getFrameDoorRooms = (
    frame: FrameConfig | null
): readonly Zone[] | null => {
    if (!frame?.isRoom) return null;
    if (!frame.isRoom()) return [];

    return [buildStampRoomZone(frame.store.getRect())];
};
