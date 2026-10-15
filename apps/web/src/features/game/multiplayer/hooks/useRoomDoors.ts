import { useMemo, useSyncExternalStore } from "react";
import { socket } from "../socket";
import { RoomDoorSync, type RoomDoorPort } from "../lib/RoomDoorSync";
import { useSocketEvent } from "./useSocketEvent";

const port: RoomDoorPort = {
    emit: (event, payload) =>
        (socket as unknown as RoomDoorPort).emit(event, payload),
};

// Keeps the room doors in sync with the server for the current socket.
// `sync` is stable, so the game scene can subscribe to it directly.
export function useRoomDoors() {
    const sync = useMemo(() => new RoomDoorSync(port), []);

    useSocketEvent("room:states", (payload) => sync.applyStates(payload));
    useSocketEvent("room:state", (payload) => sync.applyState(payload));

    useSocketEvent("room:join-requested", (payload) =>
        sync.applyJoinRequested(payload)
    );
    useSocketEvent("room:join-cancelled", (payload) =>
        sync.applyJoinCancelled(payload)
    );
    useSocketEvent("room:join-decision", (payload) =>
        sync.applyDecision(payload)
    );
    useSocketEvent("room:entitlements", (payload) =>
        sync.applyEntitlements(payload)
    );

    const joinRequests = useSyncExternalStore(
        (listener) => sync.subscribeJoinRequests(listener),
        () => sync.getJoinRequests()
    );
    const entitlements = useSyncExternalStore(
        (listener) => sync.subscribeEntitlements(listener),
        () => sync.getEntitlements()
    );

    const states = useSyncExternalStore(
        (listener) => sync.subscribe(listener),
        () => sync.getStates()
    );

    return {
        sync,
        states,
        joinRequests,
        entitlements,
        requestJoin: sync.requestJoin.bind(sync),
        answerJoin: sync.answerJoin.bind(sync),
        crossed: sync.crossed.bind(sync),
        present: sync.present.bind(sync),
        open: sync.open.bind(sync),
        lock: sync.lock.bind(sync),
        unlock: sync.unlock.bind(sync),
    };
}
