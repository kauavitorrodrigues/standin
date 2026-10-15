import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import type { RoomJoinDecisionPayload } from "@standin/contracts";
import { ROOM_EVENTS } from "@/features/game/consts/room-events";
import type {
    LockedDoor,
    LockedDoorPrompt,
} from "@/features/game/types/locked-door";

type Options = {
    requestJoin: (roomKey: string) => void;
    subscribeDecision: (
        listener: (decision: RoomJoinDecisionPayload) => void
    ) => () => void;
};

// What to keep when the scene reports the door the avatar is near. The same
// room keeps its status, so a request already sent is not asked again.
const nextPrompt = (
    previous: LockedDoorPrompt | null,
    door: LockedDoor | null
): LockedDoorPrompt | null => {
    if (door === null) return null;
    if (previous?.roomKey === door.roomKey) return previous;
    return { ...door, status: "asking" };
};

// The dialog shown to someone standing at a locked door. It closes when the
// avatar moves away, when the person cancels and when the request is accepted.
// A declined request stays on screen, saying so, until the person closes it.
// The door it was closed for stays closed until the avatar moves away from it.
export function useLockedDoorPrompt(
    game: Phaser.Game | null,
    { requestJoin, subscribeDecision }: Options
) {
    const [prompt, setPrompt] = useState<LockedDoorPrompt | null>(null);
    const dismissedRoomKey = useRef<string | null>(null);

    const dismiss = (roomKey: string) => {
        dismissedRoomKey.current = roomKey;
        setPrompt(null);
    };

    useEffect(() => {
        if (!game) return;

        const onNear = (door: LockedDoor | null) => {
            if (door === null) dismissedRoomKey.current = null;
            if (door?.roomKey === dismissedRoomKey.current) return;
            setPrompt((previous) => nextPrompt(previous, door));
        };
        game.events.on(ROOM_EVENTS.LOCKED_DOOR_NEAR, onNear);

        return () => {
            game.events.off(ROOM_EVENTS.LOCKED_DOOR_NEAR, onNear);
            dismissedRoomKey.current = null;
            setPrompt(null);
        };
    }, [game]);

    useEffect(
        () =>
            subscribeDecision(({ roomKey, accepted }) => {
                if (prompt === null || prompt.roomKey !== roomKey) return;
                if (accepted) {
                    dismiss(roomKey);
                    return;
                }
                setPrompt({ ...prompt, status: "declined" });
            }),
        [subscribeDecision, prompt]
    );

    return {
        prompt,
        onRequest: () => {
            if (prompt === null) return;
            requestJoin(prompt.roomKey);
            setPrompt({ ...prompt, status: "sent" });
        },
        onCancel: () => {
            if (prompt !== null) dismiss(prompt.roomKey);
        },
    };
}
