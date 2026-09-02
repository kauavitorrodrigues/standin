import { io, type Socket } from "socket.io-client";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@standin/contracts";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    import.meta.env.VITE_BASE_API_URL,
    {
        withCredentials: true,
        autoConnect: false,
        // Avoids the polling handshake, which needs sticky sessions across API replicas.
        transports: ["websocket"],
    }
);
