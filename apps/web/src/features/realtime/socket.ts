import { io, type Socket } from "socket.io-client";
import { SOCKET_PATH_OPTIONS, SOCKET_URL } from "@/lib/api/url";
import { SOCKET_RECONNECTION_OPTIONS } from "@/features/game/multiplayer/consts/connection";
import {
    SOCKET_APP_CHANNEL,
    type ClientToServerEvents,
    type ServerToClientEvents,
} from "@standin/contracts";

// A second, independent connection from the per-space one in
// features/game/multiplayer/socket.ts. That one's lifecycle is owned by
// space-join semantics (duplicate-session kick, socket.data.spaceId), tied
// to being on a specific space page. This one is app-wide: connected for
// the whole signed-in session so notifications (e.g. chat unread counts)
// reach the client even when it isn't on any space page.
export const realtimeSocket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(SOCKET_URL, {
        ...SOCKET_PATH_OPTIONS,
        withCredentials: true,
        auth: { channel: SOCKET_APP_CHANNEL },
        autoConnect: false,
        transports: ["websocket"],
        ...SOCKET_RECONNECTION_OPTIONS,
    });
