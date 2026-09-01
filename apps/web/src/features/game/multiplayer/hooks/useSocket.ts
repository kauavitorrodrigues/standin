import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";
import type { SocketStatus } from "../types/socket";

type Transport = Socket["io"]["engine"]["transport"];

export type SocketContextType = {
    isConnected: boolean;
    transport: Transport["name"];
    status: SocketStatus;
    lastError: string | null;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
