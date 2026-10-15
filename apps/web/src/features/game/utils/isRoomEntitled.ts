import type { RoomEntitlements } from "@/features/game/types/room";

// Whether the local avatar may walk into the room even when it is locked.
export const isRoomEntitled = (
    entitlements: RoomEntitlements,
    roomKey: string
): boolean => entitlements.all || entitlements.roomKeys.has(roomKey);
