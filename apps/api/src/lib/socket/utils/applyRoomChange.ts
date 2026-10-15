import type { Server, Socket } from "socket.io";
import { RoomEvents } from "@standin/contracts";
import type { RoomChange } from "./roomStates";
import { buildSpaceRoom } from "./buildSpaceRoom";
import { applyJoinEffects } from "./applyJoinEffects";

// An accepted change goes to the whole space. A refused or unchanged request
// is answered to the sender alone with the current state.
export const applyRoomChange = (
    io: Server,
    socket: Socket,
    spaceId: string,
    roomKey: string,
    change: RoomChange
) => {
    const payload = { roomKey, state: change.state };

    if (change.changed) {
        io.to(buildSpaceRoom(spaceId)).emit(RoomEvents.ROOM_STATE, payload);
    } else if (!change.accepted) {
        socket.emit(RoomEvents.ROOM_STATE, payload);
    }
    applyJoinEffects(() => io.sockets.sockets, spaceId, change.effects);
};
