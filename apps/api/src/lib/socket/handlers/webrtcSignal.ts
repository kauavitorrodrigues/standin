import type { Server, Socket } from "socket.io";
import { SpaceEvents, WebrtcSignalSchema } from "@standin/contracts";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";

export function registerWebrtcSignal(io: Server, socket: Socket) {
    socket.on(SpaceEvents.WEBRTC_SIGNAL, (payload) => {
        const parsed = WebrtcSignalSchema.safeParse(payload);
        if (!parsed.success) return;

        const { targetSocketId, signal } = parsed.data;
        const { spaceId } = socket.data;
        if (!spaceId) return;

        // Only relay between two peers that are actually in the same space,
        // otherwise any authenticated socket could target an arbitrary id
        // elsewhere on the server and force a WebRTC offer onto it.
        const room = buildSpaceRoom(spaceId);
        const isTargetInRoom = io.sockets.adapter.rooms
            .get(room)
            ?.has(targetSocketId);
        if (!isTargetInRoom) return;

        SocketManager.emitToSocket(targetSocketId, SpaceEvents.WEBRTC_SIGNAL, {
            fromSocketId: socket.id,
            signal,
        });
    });
}
