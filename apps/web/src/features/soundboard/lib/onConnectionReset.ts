import { socket } from "@/features/game/multiplayer/socket";

// The server forgets what a person was playing when their socket drops, and a
// reconnected socket is a new one, so both ends mean the local clip is over.
export const onConnectionReset = (listener: () => void): (() => void) => {
    socket.on("disconnect", listener);
    socket.on("connect", listener);
    return () => {
        socket.off("disconnect", listener);
        socket.off("connect", listener);
    };
};
