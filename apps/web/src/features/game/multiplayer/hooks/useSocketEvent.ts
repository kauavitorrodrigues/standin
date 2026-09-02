import { useEffect, useRef } from "react";
import type { ServerToClientEvents } from "@standin/contracts";
import { socket } from "../socket";

type RawSocket = {
    on: (event: string, listener: (...args: unknown[]) => void) => void;
    off: (event: string, listener: (...args: unknown[]) => void) => void;
};

export function useSocketEvent<E extends keyof ServerToClientEvents>(
    event: E,
    handler: ServerToClientEvents[E]
) {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const rawSocket = socket as unknown as RawSocket;

        const listener = (...args: unknown[]) => {
            (handlerRef.current as (...args: unknown[]) => void)(...args);
        };

        rawSocket.on(event, listener);

        return () => {
            rawSocket.off(event, listener);
        };
    }, [event]);
}
