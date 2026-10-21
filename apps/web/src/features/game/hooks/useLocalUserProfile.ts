import { useEffect } from "react";
import type Phaser from "phaser";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { getMapScene } from "@/features/game/utils/map";

type Params = {
    userId: string;
    name: string;
    // The photo of the profile, null when the person has none.
    profilePictureUrl: string | null;
};

// Keeps the tag over the local player on the name and the photo of the signed
// in person. The name comes from the profile query, which saving the profile
// refreshes, so a new name shows up with no reload. It also runs when the
// scene is created, since the profile can be there before the map is.
export const useLocalUserProfile = (
    game: Phaser.Game | null,
    { userId, name, profilePictureUrl }: Params
): void => {
    useEffect(() => {
        if (!game) return;

        const apply = (): void => {
            getMapScene(game)?.setLocalUserProfile({
                userId,
                name,
                profilePictureUrl,
            });
        };

        apply();
        game.events.on(SCENE_EVENTS.MAP_READY, apply);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, apply);
        };
    }, [game, userId, name, profilePictureUrl]);
};
