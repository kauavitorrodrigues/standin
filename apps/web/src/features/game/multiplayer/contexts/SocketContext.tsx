import { useEffect, useMemo, useState } from "react";
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

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setLastError(null);
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

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
        };
    }, []);

    const value = useMemo<SocketContextType>(() => {
        return {
            isConnected,
            transport,
            lastError,
            status: resolveSocketStatus(isConnected, lastError),
        };
    }, [isConnected, transport, lastError]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
