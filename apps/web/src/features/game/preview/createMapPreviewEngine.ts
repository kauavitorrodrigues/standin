import Phaser from "phaser";
import { GAME_RENDER_CONFIG } from "@/features/game/consts/game-config";
import { GAME_SCENE_KEYS } from "@/features/game/consts/scene-keys";
import { destroyGameWhenReady } from "@/features/game/utils/game";
import type { GameMapData } from "@/features/game/types/tilemap";
import { MapPreviewScene } from "./MapPreviewScene";

type Options = { container: HTMLElement; map: GameMapData };

const syncSize = (game: Phaser.Game, container: HTMLElement): void => {
    game.scale.getParentBounds();
    game.scale.setGameSize(container.clientWidth, container.clientHeight);

    const scene = game.scene.getScene(GAME_SCENE_KEYS.MAP);
    if (scene instanceof MapPreviewScene) scene.fitToViewport();
};

// A read only game for one map. Transparent, so the page shows through where
// the map has no tile, and deaf to the keyboard, the mouse and the touch.
export const createMapPreviewEngine = ({ container, map }: Options) => {
    const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: container,
        width: container.clientWidth,
        height: container.clientHeight,
        pixelArt: GAME_RENDER_CONFIG.PIXEL_ART,
        transparent: true,
        disableContextMenu: GAME_RENDER_CONFIG.DISABLE_CONTEXT_MENU,
        input: { keyboard: false, mouse: false, touch: false, gamepad: false },
        scale: { mode: Phaser.Scale.RESIZE },
        scene: [],
    });

    game.scene.add(GAME_SCENE_KEYS.MAP, MapPreviewScene, true, { map });

    const resizeObserver = new ResizeObserver(() => {
        if (game.isBooted) syncSize(game, container);
    });
    resizeObserver.observe(container);

    return () => {
        resizeObserver.disconnect();
        destroyGameWhenReady(game);
    };
};
