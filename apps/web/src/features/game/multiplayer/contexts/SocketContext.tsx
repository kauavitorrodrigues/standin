import { useEffect, useMemo, useState } from "react";
import { DuplicateSessionError } from "@standin/contracts";
import { socket } from "../socket";
import { SocketContext, type SocketContextType } from "../hooks/useSocket";
import { resolveSocketStatus } from "../utils/resolveSocketStatus";

type Transport = SocketContextType["transport"];

// This connection is scoped to a single Space, not the whole signed-in
// session, so connect()/disconnect() are driven from wherever the Space
// mounts (see useSpaceConnection), not from this provider. This only
// observes connection status.
export const SocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [transport, setTransport] = useState<Transport>(
        socket.io.engine?.transport?.name ?? "N/A"
    );
    const [lastError, setLastError] = useState<string | null>(null);
    const [isDuplicateSession, setIsDuplicateSession] = useState(false);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setLastError(null);
            setIsDuplicateSession(false);
            setTransport(socket.io.engine?.transport?.name ?? "N/A");
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        function onConnectError(error: Error) {
            setIsConnected(false);
            setLastError(error.message);
        }

        // Sent by the server right before it force-disconnects this socket
        // because the same account just joined the same space from another
        // tab/device. The disconnect event that follows is server-initiated,
        // so socket.io-client won't auto-reconnect. This stays the terminal
        // state for this tab's connection until the user acts on it.
        function onDuplicateSession() {
            setLastError(new DuplicateSessionError().message);
            setIsDuplicateSession(true);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);
        socket.on("space:duplicate-session", onDuplicateSession);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
            socket.off("space:duplicate-session", onDuplicateSession);
        };
    }, []);

    const value = useMemo<SocketContextType>(() => {
        return {
            isConnected,
            transport,
            lastError,
            status: resolveSocketStatus(isConnected, lastError),
            isDuplicateSession,
        };
    }, [isConnected, transport, lastError, isDuplicateSession]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
