import { useEffect, useMemo, useReducer } from "react";
import { socket } from "@/features/game/multiplayer/socket";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import {
    INITIAL_SAID_STATUSES,
    mergeRemoteStatuses,
    remoteStatusReducer,
} from "../utils/remoteStatuses";

/**
 * What the people of the space say about themselves, by user id: away or
 * active, and the custom status. The join snapshot starts it and each change
 * updates one person. Whoever has headphones on shows as busy, which is why
 * the ids with headphones come in. The server keeps no history for a
 * reconnect, so it is dropped when the socket goes away.
 */
export const useRemoteStatuses = (headphonesUserIds: readonly string[]) => {
    const [said, dispatch] = useReducer(
        remoteStatusReducer,
        INITIAL_SAID_STATUSES
    );

    useSocketEvent("space:joined", ({ peers }) =>
        dispatch({ type: "snapshot-received", peers })
    );
    useSocketEvent("space:peer-joined", (peer) =>
        dispatch({ type: "peer-joined", peer })
    );
    useSocketEvent("space:status", (payload) =>
        dispatch({ type: "status-received", payload })
    );
    useSocketEvent("space:peer-left", ({ userId }) =>
        dispatch({ type: "peer-left", userId })
    );

    useEffect(() => {
        const reset = () => dispatch({ type: "reset" });
        socket.on("disconnect", reset);
        return () => {
            socket.off("disconnect", reset);
        };
    }, []);

    return useMemo(
        () => mergeRemoteStatuses(said, headphonesUserIds),
        [said, headphonesUserIds]
    );
};
