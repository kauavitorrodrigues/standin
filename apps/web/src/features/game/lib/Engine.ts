import Phaser from "phaser";
import {
    GAME_PHYSICS_CONFIG,
    GAME_RENDER_CONFIG,
} from "@/features/game/consts/game-config";
import { getFpsLimit } from "@/features/settings/performance/lib/performanceValues";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";
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
import {
    bindHoverClickSubscription,
    bindHoverSubscription,
    bindSelectedSubscription,
    pinHover,
    selectHover,
} from "@/features/game/utils/hover";
import { getMapScene } from "@/features/game/utils/map";
import { startDecorator } from "@/features/game/utils/startDecorator";
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
        fps: {
            limit: getFpsLimit(performanceSettingsPreference.get()),
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
        },
        // The layer over the canvas where the name tags live. It does not take
        // the mouse: the game reads the pointer by position.
        dom: {
            createContainer: true,
            pointerEvents: "none",
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

    // While someone decorates, what the scene shows is their draft. The server
    // copy that arrives meanwhile (an event of the space) would paint over it,
    // so it waits: the page asks for the map again when the decorator closes.
    let decorating = false;

    return {
        game,
        destroy: () => {
            unbindResize();
            destroyGameWhenReady(game);
        },
        zoomIn: () => getMapCameraController(game)?.zoomIn(),
        zoomOut: () => getMapCameraController(game)?.zoomOut(),
        focusOnPlayer: () => focusOnPlayer(game),
        focusPoint: (x, y, offsetXPixels) =>
            getMapScene(game)?.focusPoint(x, y, offsetXPixels),
        setPlaced: (placed, assets, options) => {
            if (decorating) return;
            getMapScene(game)?.setPlaced(placed, assets, options);
        },
        startDecorator: (options) => {
            const stop = startDecorator(game, options);
            if (!stop) return () => undefined;

            decorating = true;
            return () => {
                decorating = false;
                stop();
            };
        },
        subscribeToCameraState: (listener) =>
            bindCameraStateSubscription(game, listener),
        subscribeToHover: (event, listener) =>
            bindHoverSubscription(game, event, listener),
        subscribeToSelected: (event, listener) =>
            bindSelectedSubscription(game, event, listener),
        subscribeToHoverClick: (event, listener) =>
            bindHoverClickSubscription(game, event, listener),
        selectHover: (event, id) => selectHover(game, event, id),
        pinHover: (event, id) => pinHover(game, event, id),
    };
};
