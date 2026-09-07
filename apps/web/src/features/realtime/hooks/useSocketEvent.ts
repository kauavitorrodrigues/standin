import { useEffect, useRef } from "react";
import type { ServerToClientEvents } from "@standin/contracts";
import { realtimeSocket } from "@/features/realtime/socket";

// A ref holds the latest handler so the effect only re-subscribes when the
// event name itself changes, not on every render a caller passes a fresh
// inline handler.
export function useSocketEvent<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
) {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        // socket.io-client's overloads don't distribute over a generic `K`,
        // so the listener is typed loosely here; the exported signature
        // above is what keeps call sites type-safe.
        const listener = (...args: unknown[]) =>
            (handlerRef.current as (...args: unknown[]) => void)(...args);

        realtimeSocket.on(event, listener as never);
        return () => {
            realtimeSocket.off(event, listener as never);
        };
    }, [event]);
}
