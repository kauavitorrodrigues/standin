import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomCrossedSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { applyRoomChange } from "../utils/applyRoomChange";

export function registerRoomCrossed(io: Server, socket: Socket) {
    socket.on(RoomEvents.ROOM_CROSSED, (payload) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) return;

            const parsed = RoomCrossedSchema.safeParse(payload);
            if (!parsed.success) return;

            const { roomKey } = parsed.data;
            const change = RoomStates.cross(spaceId, roomKey, socket.id, socket.data.userId, parsed.data.direction);
            applyRoomChange(io, socket, spaceId, roomKey, change);
        } catch (error) {
            console.error(error);
        }
    });
}
