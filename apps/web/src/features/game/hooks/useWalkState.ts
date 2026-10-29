import { useCallback, useEffect, useState } from "react";
import type Phaser from "phaser";
import { toast } from "@/components/ui/toast";
import { WALK_EVENTS } from "@/features/game/consts/walk-events";
import { WALK_MESSAGES } from "@/features/game/consts/walk-messages";
import type { WalkPurpose } from "@/features/game/types/walk";

const TILE_PURPOSE: WalkPurpose = { kind: "tile" };

// Whether the avatar is walking to a tile after a double click, or to a desk
// or a person the page asked for, where it is going, and the way to stop it.
// A walk that cannot be made is told as an error.
export const useWalkState = (game: Phaser.Game | null) => {
    const [isWalking, setIsWalking] = useState(false);
    const [purpose, setPurpose] = useState<WalkPurpose>(TILE_PURPOSE);

    useEffect(() => {
        if (!game) return;

        const onFailed = () =>
            toast.add({ title: WALK_MESSAGES.blocked, type: "error" });

        game.events.on(WALK_EVENTS.CHANGED, setIsWalking);
        game.events.on(WALK_EVENTS.PURPOSE, setPurpose);
        game.events.on(WALK_EVENTS.FAILED, onFailed);
        return () => {
            game.events.off(WALK_EVENTS.CHANGED, setIsWalking);
            game.events.off(WALK_EVENTS.PURPOSE, setPurpose);
            game.events.off(WALK_EVENTS.FAILED, onFailed);
            setIsWalking(false);
            setPurpose(TILE_PURPOSE);
        };
    }, [game]);

    const cancel = useCallback(() => {
        game?.events.emit(WALK_EVENTS.CANCEL);
    }, [game]);

    return { isWalking, purpose, cancel };
};
