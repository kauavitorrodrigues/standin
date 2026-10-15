import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomUnlockSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { applyRoomChange } from "../utils/applyRoomChange";

export function registerRoomUnlock(io: Server, socket: Socket) {
    socket.on(RoomEvents.ROOM_UNLOCK, (payload) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) return;

            const parsed = RoomUnlockSchema.safeParse(payload);
            if (!parsed.success) return;

            const { roomKey } = parsed.data;
            const change = RoomStates.unlock(spaceId, roomKey, socket.id);
            applyRoomChange(io, socket, spaceId, roomKey, change);
        } catch (error) {
            console.error(error);
        }
    });
}
