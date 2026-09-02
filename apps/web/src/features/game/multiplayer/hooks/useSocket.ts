import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";
import type { SocketStatus } from "../types/socket";

type Transport = Socket["io"]["engine"]["transport"];

export type SocketContextType = {
    isConnected: boolean;
    transport: Transport["name"];
    status: SocketStatus;
    lastError: string | null;
    // True once this tab's connection was kicked for space:duplicate-session
    // (the same account joined the same space from another tab/device).
    // Distinct from lastError/status: this is terminal for the tab until the
    // user acts on it, not a transient connection error to retry silently.
    isDuplicateSession: boolean;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
