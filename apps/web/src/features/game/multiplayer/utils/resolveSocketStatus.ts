import type { SocketStatus } from "../types/socket";

export const resolveSocketStatus = (
    isConnected: boolean,
    lastError: string | null
): SocketStatus => {
    if (lastError) return "error";
    if (isConnected) return "connected";
    return "disconnected";
};
