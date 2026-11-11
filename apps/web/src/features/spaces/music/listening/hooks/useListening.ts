import { useCallback, useEffect, useReducer } from "react";
import { socket } from "@/features/game/multiplayer/socket";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import type { ListeningState } from "../types/listening";
import {
    INITIAL_LISTENING_STATE,
    listeningReducer,
} from "../utils/listeningState";

// What the people of the space are playing. The join snapshot starts it and
// each change updates one person; a null track clears them. The server keeps no
// history for a reconnect, so everything is dropped on a join and when the
// socket goes away, and the next snapshot fills it again.
export function useListening(): ListeningState {
    const [state, dispatch] = useReducer(
        listeningReducer,
        INITIAL_LISTENING_STATE
    );

    const reset = useCallback(() => dispatch({ type: "reset" }), []);

    useSocketEvent("space:joined", ({ listening }) =>
        dispatch({ type: "snapshot-received", entries: listening })
    );

    useSocketEvent("space:music-listening", ({ userId, track }) =>
        dispatch({ type: "track-received", userId, track })
    );

    useEffect(() => {
        socket.on("disconnect", reset);
        return () => {
            socket.off("disconnect", reset);
        };
    }, [reset]);

    return state;
}
