import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { realtimeSocket } from "@/features/realtime/socket";
import { useAuth } from "@/features/auth/hooks/useAuth";

type RealtimeSocketContextValue = {
    isConnected: boolean;
};

const RealtimeSocketContext = createContext<RealtimeSocketContextValue | null>(
    null
);

// Connects for the whole signed-in session, independent of which page is
// mounted, unlike the per-space socket (features/game/multiplayer). Effect
// is keyed on the user id (rarely changes) rather than the user object, so
// an unrelated re-render of AuthProvider's value doesn't reconnect it.
export const RealtimeSocketProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(realtimeSocket.connected);

    useEffect(() => {
        realtimeSocket.connect();

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        realtimeSocket.on("connect", onConnect);
        realtimeSocket.on("disconnect", onDisconnect);

        return () => {
            realtimeSocket.off("connect", onConnect);
            realtimeSocket.off("disconnect", onDisconnect);
            realtimeSocket.disconnect();
        };
    }, [user.id]);

    return (
        <RealtimeSocketContext.Provider value={{ isConnected }}>
            {children}
        </RealtimeSocketContext.Provider>
    );
};

export const useRealtimeSocket = (): RealtimeSocketContextValue => {
    const context = useContext(RealtimeSocketContext);
    if (!context) {
        throw new Error(
            "useRealtimeSocket must be used within a RealtimeSocketProvider"
        );
    }
    return context;
};
