import { io, type Socket } from "socket.io-client";
import { SOCKET_PATH_OPTIONS, SOCKET_URL } from "@/lib/api/url";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@standin/contracts";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    SOCKET_URL,
    {
        ...SOCKET_PATH_OPTIONS,
        withCredentials: true,
        autoConnect: false,
        // Avoids the polling handshake, which needs sticky sessions across API replicas.
        transports: ["websocket"],
    }
);
