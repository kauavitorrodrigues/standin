import { useEffect, useState } from "react";
import type Phaser from "phaser";
import { REMOTE_SELECTION_EVENTS } from "@/features/game/consts/remote-selection";

// The user id of the person whose avatar was clicked, or null with none.
export const useSelectedPerson = (game: Phaser.Game | null): string | null => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!game) return;

        game.events.on(REMOTE_SELECTION_EVENTS.CHANGED, setUserId);
        return () => {
            game.events.off(REMOTE_SELECTION_EVENTS.CHANGED, setUserId);
            setUserId(null);
        };
    }, [game]);

    return userId;
};
