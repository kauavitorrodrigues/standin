import { useEffect, useMemo, useRef, useState } from "react";
import { DuplicateSessionError } from "@standin/contracts";
import { socket } from "../socket";
import { SocketContext, type SocketContextType } from "../hooks/useSocket";
import { resolveSocketStatus } from "../utils/resolveSocketStatus";
import { toast } from "@/components/ui/toast";
import { MULTIPLAYER_CONNECTION_MESSAGES } from "../consts/messages";

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

    // True once this tab has actually connected at least once - lets
    // onDisconnect tell "we were live and just dropped" apart from "the
    // very first handshake attempt failed" (that case is reported through
    // connect_error instead, so it isn't toasted twice).
    const hasConnectedRef = useRef(false);
    // True while a real connection drop is being recovered from, so onConnect
    // knows to toast "reconnected" instead of staying silent on every mount.
    const isRecoveringDropRef = useRef(false);
    // Guards connect_error from toasting on every automatic retry attempt
    // socket.io-client makes; reset once a connection actually succeeds.
    const hasToastedConnectErrorRef = useRef(false);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setLastError(null);
            setIsDuplicateSession(false);
            setTransport(socket.io.engine?.transport?.name ?? "N/A");
            if (isRecoveringDropRef.current) {
                toast.add({
                    title: MULTIPLAYER_CONNECTION_MESSAGES.reconnected,
                    type: "success",
                });
            }
            hasConnectedRef.current = true;
            isRecoveringDropRef.current = false;
            hasToastedConnectErrorRef.current = false;
        }

        function onDisconnect(reason: string) {
            setIsConnected(false);
            setTransport("N/A");

            // "io client disconnect": we called socket.disconnect() ourselves
            // (e.g. useSpaceConnection tearing down on unmount) - expected,
            // not a failure. "io server disconnect": the duplicate-session
            // kick already has its own dedicated blocking UI; a toast here
            // would be redundant. Anything else (ping timeout, transport
            // close/error) is an actual drop worth surfacing.
            if (
                reason === "io client disconnect" ||
                reason === "io server disconnect"
            ) {
                return;
            }

            if (hasConnectedRef.current) {
                isRecoveringDropRef.current = true;
                toast.add({
                    title: MULTIPLAYER_CONNECTION_MESSAGES.connectionLost,
                    type: "warning",
                });
            }
        }

        function onConnectError(error: Error) {
            setIsConnected(false);
            setLastError(error.message);

            if (!hasToastedConnectErrorRef.current) {
                hasToastedConnectErrorRef.current = true;
                toast.add({
                    title: MULTIPLAYER_CONNECTION_MESSAGES.handshakeFailed,
                    type: "error",
                });
            }
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
