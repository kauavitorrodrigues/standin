import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomJoinRequestSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";

export function registerRoomJoinRequest(io: Server, socket: Socket) {
    socket.on(RoomEvents.ROOM_JOIN_REQUEST, (payload) => {
        try {
            const { spaceId, userId } = socket.data;
            if (!spaceId) return;

            const parsed = RoomJoinRequestSchema.safeParse(payload);
            if (!parsed.success) return;

            const { roomKey } = parsed.data;
            const requested = RoomStates.requestJoin(
                spaceId,
                roomKey,
                socket.id,
                userId
            );
            if (!requested) return;

            requested.notify.forEach((socketId) => {
                io.to(socketId).emit(RoomEvents.ROOM_JOIN_REQUESTED, {
                    roomKey,
                    userId,
                });
            });
        } catch (error) {
            console.error(error);
        }
    });
}
