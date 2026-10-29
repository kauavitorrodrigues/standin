import { useEffect, useState } from "react";
import { DESK_EVENTS } from "@/features/game/consts/desk";
import type { GameEngineHandle } from "@/features/game/types/game";
import { useSpaceDesks } from "../queries/useSpaceDesks";

// Gives the scene the claims of the space, which live in the query, and
// follows whether the avatar is at its own desk. The subscription is set up
// before the claims are sent, so the first answer is not missed.
export const useSceneDesks = (
    handle: GameEngineHandle | null,
    spaceId: string,
    userId: string
) => {
    const { desks } = useSpaceDesks(spaceId);
    const [isAtOwnDesk, setIsAtOwnDesk] = useState(false);

    useEffect(() => {
        if (!handle) return;

        handle.game.events.on(DESK_EVENTS.AT_OWN_DESK_CHANGED, setIsAtOwnDesk);
        return () => {
            handle.game.events.off(
                DESK_EVENTS.AT_OWN_DESK_CHANGED,
                setIsAtOwnDesk
            );
            setIsAtOwnDesk(false);
        };
    }, [handle]);

    useEffect(() => {
        handle?.setDeskClaims(desks, userId);
    }, [handle, desks, userId]);

    return { isAtOwnDesk, desks };
};
