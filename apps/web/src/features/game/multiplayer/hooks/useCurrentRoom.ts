import { useEffect, useState } from "react";
import type Phaser from "phaser";
import { ROOM_DOOR_STATES } from "@standin/contracts";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { ROOM_EVENTS } from "@/features/game/consts/room-events";
import type { CurrentRoom } from "@/features/game/types/room-current";
import { getMapScene } from "@/features/game/utils/map";
import type { RoomEntitlements } from "../lib/RoomDoorSync";
import { useRoomDoors } from "./useRoomDoors";

// The part of the scene that takes the entry rights and the admission of the
// local user. Optional so this compiles while the scene is being finished.
type EntryScene = {
    setRoomEntitlements?: (entitlements: RoomEntitlements) => void;
    admitToRoom?: (roomKey: string) => void;
};

const getEntryScene = (game: Phaser.Game): EntryScene | null =>
    getMapScene(game) as unknown as EntryScene | null;

// Connects the scene to the doors the server owns, and tells which room the
// local avatar is in, with the state of its doors and what locks it. Like the
// connection hook, it listens to MAP_READY because the scene may not exist yet
// when the game is created.
export function useCurrentRoom(game: Phaser.Game | null) {
    const {
        sync,
        states,
        lock,
        unlock,
        joinRequests,
        entitlements,
        requestJoin,
        answerJoin,
    } = useRoomDoors();
    const [room, setRoom] = useState<CurrentRoom | null>(null);

    useEffect(() => {
        if (!game) return;

        const bind = () => getMapScene(game)?.bindRoomDoors(sync);
        bind();
        game.events.on(SCENE_EVENTS.MAP_READY, bind);
        game.events.on(ROOM_EVENTS.CURRENT_CHANGED, setRoom);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, bind);
            game.events.off(ROOM_EVENTS.CURRENT_CHANGED, setRoom);
            getMapScene(game)?.bindRoomDoors(null);
            setRoom(null);
        };
    }, [game, sync]);

    // The scene decides who may cross a locked door, so it gets the rights on
    // every change and again when it becomes ready.
    useEffect(() => {
        if (!game) return;

        const apply = () =>
            getEntryScene(game)?.setRoomEntitlements?.(entitlements);
        apply();
        game.events.on(SCENE_EVENTS.MAP_READY, apply);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, apply);
        };
    }, [game, entitlements]);

    useEffect(
        () =>
            sync.subscribeDecision(({ roomKey, accepted }) => {
                if (!accepted) return;
                if (game) getEntryScene(game)?.admitToRoom?.(roomKey);
            }),
        [game, sync]
    );

    const roomKey = room?.roomKey ?? null;
    const pendingRequests = joinRequests.filter(
        (request) => request.roomKey === roomKey
    );
    const state =
        (roomKey !== null ? states.get(roomKey) : undefined) ??
        ROOM_DOOR_STATES.OPEN;

    return {
        roomLabel: room?.roomLabel ?? null,
        state,
        pendingRequests,
        onAnswer: (userId: string, accept: boolean) => {
            if (roomKey !== null) answerJoin(roomKey, userId, accept);
        },
        requestJoin,
        subscribeDecision: sync.subscribeDecision.bind(sync),
        onLock: () => {
            if (roomKey !== null) lock(roomKey);
        },
        onUnlock: () => {
            if (roomKey !== null) unlock(roomKey);
        },
    };
}
