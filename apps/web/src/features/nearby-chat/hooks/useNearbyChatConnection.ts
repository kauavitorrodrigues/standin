import { useEffect, useMemo } from "react";
import type Phaser from "phaser";
import { NearbyMessageStore } from "@/features/game/lib/NearbyMessageStore";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { getMapScene } from "@/features/game/utils/map";
import { getNearbyHistoryKey } from "@/features/game/utils/getNearbyHistoryKey";
import type { NearbyChatConnection } from "@/features/nearby-chat/types/nearby-chat";

type Params = {
    game: Phaser.Game | null;
    spaceId: string;
    userId: string;
    sendMessage: (text: string) => void;
    sendTyping: (isTyping: boolean) => void;
    isEnabled: boolean;
};

// Makes the store of the nearby messages for this space and person, and hands it
// to the map scene, which draws the bubbles from it. The panel reads the same
// store. It also runs when the scene is created, since the page can be ready
// before the map is.
export const useNearbyChatConnection = ({
    game,
    spaceId,
    userId,
    sendMessage,
    sendTyping,
    isEnabled,
}: Params): NearbyChatConnection => {
    const store = useMemo(
        () =>
            new NearbyMessageStore({
                storageKey: getNearbyHistoryKey(spaceId, userId),
            }),
        [spaceId, userId]
    );

    // Mounted twice in development, so the timers are armed again every time.
    useEffect(() => {
        store.restart();
        return () => store.destroy();
    }, [store]);

    useEffect(() => {
        if (!game) return;

        const apply = (): void => getMapScene(game)?.setNearbyStore(store);
        apply();
        game.events.on(SCENE_EVENTS.MAP_READY, apply);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, apply);
            getMapScene(game)?.setNearbyStore(null);
        };
    }, [game, store]);

    return useMemo(
        () => ({ store, sendMessage, sendTyping, isEnabled }),
        [store, sendMessage, sendTyping, isEnabled]
    );
};
