import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomLockSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { applyRoomChange } from "../utils/applyRoomChange";

export function registerRoomLock(io: Server, socket: Socket) {
    socket.on(RoomEvents.ROOM_LOCK, (payload) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) return;

            const parsed = RoomLockSchema.safeParse(payload);
            if (!parsed.success) return;

            const { roomKey } = parsed.data;
            const change = RoomStates.lock(spaceId, roomKey, socket.id);
            applyRoomChange(io, socket, spaceId, roomKey, change);
        } catch (error) {
            console.error(error);
        }
    });
}
