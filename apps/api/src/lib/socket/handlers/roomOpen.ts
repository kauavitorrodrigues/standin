import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomOpenSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { applyRoomChange } from "../utils/applyRoomChange";

export function registerRoomOpen(io: Server, socket: Socket) {
    socket.on(RoomEvents.ROOM_OPEN, (payload) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) return;

            const parsed = RoomOpenSchema.safeParse(payload);
            if (!parsed.success) return;

            const { roomKey } = parsed.data;
            const change = RoomStates.open(spaceId, roomKey);
            applyRoomChange(io, socket, spaceId, roomKey, change);
        } catch (error) {
            console.error(error);
        }
    });
}
