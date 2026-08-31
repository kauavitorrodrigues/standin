import Phaser from "phaser";
import { GAME_RENDER_CONFIG } from "@/features/game/consts/game-config";
import { getMapScene } from "@/features/game/utils/map";

export const destroyGameWhenReady = (game: Phaser.Game): void => {
    if (game.isBooted) {
        game.destroy(GAME_RENDER_CONFIG.REMOVE_CANVAS_ON_DESTROY);
        return;
    }
    game.events.once(Phaser.Core.Events.READY, () => {
        game.destroy(GAME_RENDER_CONFIG.REMOVE_CANVAS_ON_DESTROY);
    });
};

const syncGameSize = (game: Phaser.Game, container: HTMLElement): void => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    game.scale.setGameSize(width, height);

    const scene = getMapScene(game);
    if (!scene) return;

    scene.cameras.main.setSize(width, height);
    scene.cameraController?.fitToViewport();
};

export const bindGameResize = (
    game: Phaser.Game,
    container: HTMLElement
): (() => void) => {
    game.events.once(Phaser.Core.Events.READY, () =>
        syncGameSize(game, container)
    );

    const resizeObserver = new ResizeObserver(() => {
        if (!game.isBooted) return;

        syncGameSize(game, container);
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
};
