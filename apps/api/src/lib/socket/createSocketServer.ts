import { createServer } from "node:http";
import { Server } from "socket.io";
import { AvatarService, UserService } from "@standin/core";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    SocketData,
} from "@standin/contracts";
import { SocketManager } from "./socketManager";
import { corsSocketOptions } from "@/consts/server";
import { requiresSocketAuth } from "@/lib/socket/middlewares/requiresAuth";
import { registerDisconnect } from "@/lib/socket/handlers/disconnect";
import { registerJoinSpace } from "@/lib/socket/handlers/joinSpace";
import { registerJoinMap } from "@/lib/socket/handlers/joinMap";
import { registerEditorAcquire } from "@/lib/socket/handlers/editorAcquire";
import { registerEditorHeartbeat } from "@/lib/socket/handlers/editorHeartbeat";
import { registerEditorRelease } from "@/lib/socket/handlers/editorRelease";
import { registerRoomCrossed } from "@/lib/socket/handlers/roomCrossed";
import { registerRoomOpen } from "@/lib/socket/handlers/roomOpen";
import { registerRoomPresent } from "@/lib/socket/handlers/roomPresent";
import { registerRoomLock } from "@/lib/socket/handlers/roomLock";
import { registerRoomUnlock } from "@/lib/socket/handlers/roomUnlock";
import { registerRoomJoinRequest } from "@/lib/socket/handlers/roomJoinRequest";
import { registerRoomJoinAnswer } from "@/lib/socket/handlers/roomJoinAnswer";
import { registerWebrtcSignal } from "@/lib/socket/handlers/webrtcSignal";
import { broadcastAvatarChange } from "@/lib/socket/services/broadcastAvatarChange";
import { broadcastNameChange } from "@/lib/socket/services/broadcastNameChange";
import { broadcastProfilePictureChange } from "@/lib/socket/services/broadcastProfilePictureChange";
import { buildUserRoom } from "@/lib/socket/utils/buildUserRoom";

export function createSocketServer(
    httpServer: ReturnType<typeof createServer>
) {
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        Record<string, never>,
        SocketData
    >(httpServer, { cors: corsSocketOptions });

    io.use(requiresSocketAuth);

    SocketManager.set(io);

    // Registered once per server. Runs when the sheet of a person is replaced
    // or cleared, before the core deletes the old file.
    AvatarService.onSheetChanged(broadcastAvatarChange);

    // Registered once per server. Runs after a person is renamed, so the tag
    // over their avatar changes in the spaces where they are.
    UserService.onNameChanged(broadcastNameChange);

    // Registered once per server. Runs after a person sets or removes the
    // profile picture, so the tag over their avatar changes with no refresh.
    UserService.onProfilePictureChanged(broadcastProfilePictureChange);

    io.on("connection", (socket) => {
        // Every authenticated connection joins its own user room, regardless
        // of whether it ever joins a space, so app-wide notifications (e.g.
        // chat unread counts) can reach a signed-in client that isn't
        // currently on a space page.
        socket.join(buildUserRoom(socket.data.userId));

        registerJoinSpace(io, socket);
        registerJoinMap(socket);
        registerEditorAcquire(socket);
        registerEditorHeartbeat(socket);
        registerEditorRelease(socket);
        registerWebrtcSignal(io, socket);
        registerRoomCrossed(io, socket);
        registerRoomOpen(io, socket);
        registerRoomPresent(io, socket);
        registerRoomLock(io, socket);
        registerRoomUnlock(io, socket);
        registerRoomJoinRequest(io, socket);
        registerRoomJoinAnswer(io, socket);
        registerDisconnect(socket);
    });
}
