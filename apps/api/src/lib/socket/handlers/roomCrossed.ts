import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomCrossedSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { applyRoomChange } from "../utils/applyRoomChange";
import { AnnouncerSync } from "../realtime/AnnouncerSync";
import { buildAnnouncersSender } from "../utils/buildAnnouncersSender";
import { RaisedHandSync } from "../realtime/RaisedHandSync";
import { buildRaisedHandsSender } from "../utils/buildRaisedHandsSender";

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
            // A private room closes its sound to the ones outside.
            AnnouncerSync.refreshOnMove(
                spaceId,
                socket.id,
                buildAnnouncersSender(io)
            );
            RaisedHandSync.refreshOnMove(
                spaceId,
                socket.id,
                buildRaisedHandsSender(io)
            );
        } catch (error) {
            console.error(error);
        }
    });
}
