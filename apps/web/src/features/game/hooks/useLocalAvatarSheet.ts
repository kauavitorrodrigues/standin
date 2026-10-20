import { useEffect } from "react";
import type Phaser from "phaser";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { getMapScene } from "@/features/game/utils/map";
import { useMyAvatar } from "@/features/avatar/queries/useMyAvatar";

// Keeps the sprite of the local player on the sheet of the avatar the person
// has now. The avatar comes from the query `GET /users/me/avatar`, which the
// editor updates when the person confirms, so a saved avatar shows up here
// with no refresh. It also runs when the scene is created, since the avatar
// can arrive before the map does. Without an avatar the player is the ghost.
export const useLocalAvatarSheet = (game: Phaser.Game | null): void => {
    const { data } = useMyAvatar();
    const avatarSheetFileId = data?.avatarSheetFileId;

    useEffect(() => {
        if (!game) return;
        if (avatarSheetFileId === undefined) return;

        const apply = (): void => {
            getMapScene(game)?.setLocalAvatarSheet(avatarSheetFileId);
        };

        apply();
        game.events.on(SCENE_EVENTS.MAP_READY, apply);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, apply);
        };
    }, [game, avatarSheetFileId]);
};
