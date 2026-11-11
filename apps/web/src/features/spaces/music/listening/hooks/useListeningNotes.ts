import { useEffect, useMemo } from "react";
import type Phaser from "phaser";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { getMapScene } from "@/features/game/utils/map";
import { useEffectivePerformanceSettings } from "@/features/settings/performance/hooks/useEffectivePerformanceSettings";
import type { ListeningState } from "../types/listening";
import { getPlayingUserIds } from "../utils/getPlayingUserIds";

// Tells the map who is playing music, so the notes rise from their avatars,
// and whether the person asked for less motion in the app. The scene may not
// exist yet, so it is fed again once it is ready.
export function useListeningNotes(
    game: Phaser.Game | null,
    listening: ListeningState
): void {
    const { reduceMotion } = useEffectivePerformanceSettings();
    const playingUserIds = useMemo(
        () => getPlayingUserIds(listening),
        [listening]
    );

    useEffect(() => {
        if (!game) return;

        const feed = () => {
            const scene = getMapScene(game);
            scene?.setListeningUserIds(playingUserIds);
            scene?.setAppMotionReduced(reduceMotion);
        };

        feed();
        game.events.on(SCENE_EVENTS.MAP_READY, feed);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, feed);
        };
    }, [game, playingUserIds, reduceMotion]);
}
