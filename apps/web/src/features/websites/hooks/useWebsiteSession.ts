import { useCallback, useEffect, useState } from "react";
import { WALK_EVENTS } from "@/features/game/consts/walk-events";
import { WEBSITE_EVENTS } from "@/features/game/consts/website";
import type { GameEngineHandle } from "@/features/game/types/game";

const NONE: readonly string[] = [];

// Which website object the local person has open, and everything that decides
// whether it may stay open: the object has to be within reach, and it is only
// shown on the view of the office. An object that is not within reach can be
// walked to, and it opens by itself when the avatar gets there. A minimized
// object stays mounted, so the site does not load again when it comes back.
export const useWebsiteSession = (handle: GameEngineHandle | null) => {
    const [inReachIds, setInReachIds] = useState<readonly string[]>(NONE);
    const [viewingId, setViewingId] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [walkingToId, setWalkingToId] = useState<string | null>(null);

    useEffect(() => {
        const game = handle?.game;
        if (!game) return;

        const onReach = (ids: string[]) => setInReachIds(ids);
        const stopWalking = () => setWalkingToId(null);
        const onWalkChanged = (isWalking: boolean) => {
            if (!isWalking) stopWalking();
        };
        game.events.on(WEBSITE_EVENTS.IN_REACH_CHANGED, onReach);
        game.events.on(WALK_EVENTS.CHANGED, onWalkChanged);
        game.events.on(WALK_EVENTS.FAILED, stopWalking);
        return () => {
            game.events.off(WEBSITE_EVENTS.IN_REACH_CHANGED, onReach);
            game.events.off(WALK_EVENTS.CHANGED, onWalkChanged);
            game.events.off(WALK_EVENTS.FAILED, stopWalking);
            setInReachIds(NONE);
            setWalkingToId(null);
        };
    }, [handle]);

    const open = useCallback((objectId: string) => {
        setViewingId(objectId);
        setIsMinimized(false);
        setWalkingToId(null);
    }, []);

    const close = useCallback(() => {
        setViewingId(null);
        setIsMinimized(false);
    }, []);

    const toggleMinimized = useCallback(
        () => setIsMinimized((current) => !current),
        []
    );

    // Walks to the reach of the object, and opens it once there.
    const walkTo = useCallback(
        (objectId: string) => {
            if (!handle?.walkToWebsite(objectId)) return;
            setWalkingToId(objectId);
        },
        [handle]
    );

    // Out of reach, it closes. Derived while rendering: the state is reset
    // right away, with no frame drawn for an object out of reach.
    if (viewingId !== null && !inReachIds.includes(viewingId)) {
        setViewingId(null);
        setIsMinimized(false);
    }
    if (walkingToId !== null && inReachIds.includes(walkingToId)) {
        setViewingId(walkingToId);
        setIsMinimized(false);
        setWalkingToId(null);
    }

    return {
        inReachIds,
        viewingId,
        isMinimized,
        open,
        close,
        toggleMinimized,
        walkTo,
    };
};
