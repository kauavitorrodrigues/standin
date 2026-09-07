import { createServer } from "node:http";
import { Server } from "socket.io";
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
import { registerWebrtcSignal } from "@/lib/socket/handlers/webrtcSignal";
import { buildUserRoom } from "@/lib/socket/utils/buildUserRoom";

export function createSocketServer(httpServer: ReturnType<typeof createServer>) {
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        Record<string, never>,
        SocketData
    >(httpServer, { cors: corsSocketOptions });

    io.use(requiresSocketAuth);

    SocketManager.set(io);

    io.on("connection", (socket) => {
        // Every authenticated connection joins its own user room, regardless
        // of whether it ever joins a space, so app-wide notifications (e.g.
        // chat unread counts) can reach a signed-in client that isn't
        // currently on a space page.
        socket.join(buildUserRoom(socket.data.userId));

        registerJoinSpace(io, socket);
        registerWebrtcSignal(io, socket);
        registerDisconnect(socket);
    });
}
