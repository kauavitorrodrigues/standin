import Phaser from "phaser";
import {
    GAME_PHYSICS_CONFIG,
    GAME_RENDER_CONFIG,
} from "@/features/game/consts/game-config";
import { GAME_SCENE_KEYS } from "@/features/game/consts/scene-keys";
import { MapScene } from "@/features/game/scenes/MapScene";
import {
    bindGameResize,
    destroyGameWhenReady,
} from "@/features/game/utils/game";
import {
    bindCameraStateSubscription,
    getMapCameraController,
} from "@/features/game/utils/camera";
import { focusOnPlayer } from "@/features/game/utils/player";
import type {
    GameEngineHandle,
    GameEngineOptions,
} from "@/features/game/types/game";

export const createGameEngine = ({
    container,
    map,
    initialCameraOffsetX,
}: GameEngineOptions): GameEngineHandle => {
    const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: container,
        width: container.clientWidth,
        height: container.clientHeight,
        pixelArt: GAME_RENDER_CONFIG.PIXEL_ART,
        backgroundColor: GAME_RENDER_CONFIG.BACKGROUND_COLOR,
        disableContextMenu: GAME_RENDER_CONFIG.DISABLE_CONTEXT_MENU,
        scale: {
            mode: Phaser.Scale.RESIZE,
        },
        physics: {
            default: GAME_PHYSICS_CONFIG.SYSTEM,
            arcade: {
                debug: GAME_PHYSICS_CONFIG.DEBUG,
            },
        },
        scene: [],
    });

    game.scene.add(GAME_SCENE_KEYS.MAP, MapScene, true, {
        map,
        initialCameraOffsetX,
    });

    const unbindResize = bindGameResize(game, container);

    return {
        game,
        destroy: () => {
            unbindResize();
            destroyGameWhenReady(game);
        },
        zoomIn: () => getMapCameraController(game)?.zoomIn(),
        zoomOut: () => getMapCameraController(game)?.zoomOut(),
        focusOnPlayer: () => focusOnPlayer(game),
        subscribeToCameraState: (listener) =>
            bindCameraStateSubscription(game, listener),
    };
};
