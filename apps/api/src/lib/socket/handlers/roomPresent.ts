import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomPresentSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { applyRoomChange } from "../utils/applyRoomChange";

// The avatar is already inside the room (spawn or reload), so it is allowed to
// lock and unlock. The state is not touched, only the sender hears it.
export function registerRoomPresent(io: Server, socket: Socket) {
    socket.on(RoomEvents.ROOM_PRESENT, (payload) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) return;

            const parsed = RoomPresentSchema.safeParse(payload);
            if (!parsed.success) return;

            const { roomKey } = parsed.data;
            const change = RoomStates.present(spaceId, roomKey, socket.id, socket.data.userId);
            applyRoomChange(io, socket, spaceId, roomKey, change);
        } catch (error) {
            console.error(error);
        }
    });
}
