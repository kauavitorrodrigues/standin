import Phaser from "phaser";
import { GAME_RENDER_CONFIG } from "@/features/game/consts/game-config";
import { GAME_SCENE_KEYS } from "@/features/game/consts/scene-keys";
import { destroyGameWhenReady } from "@/features/game/utils/game";
import type { GameMapData } from "@/features/game/types/tilemap";
import { MAP_PREVIEW_CAPTURE } from "./consts";
import { MapPreviewScene } from "./MapPreviewScene";

// The stage the capture draws on. It is never seen: out of the screen and
// small, since the photo is drawn on its own texture and not on this canvas.
const createStage = (): HTMLDivElement => {
    const stage = document.createElement("div");
    stage.setAttribute("aria-hidden", "true");
    stage.style.cssText = [
        "position:fixed",
        "left:-10000px",
        "top:0",
        `width:${MAP_PREVIEW_CAPTURE.STAGE_SIZE}px`,
        `height:${MAP_PREVIEW_CAPTURE.STAGE_SIZE}px`,
        "pointer-events:none",
        "visibility:hidden",
    ].join(";");
    document.body.append(stage);
    return stage;
};

const createGame = (stage: HTMLElement, size: number): Phaser.Game =>
    new Phaser.Game({
        type: Phaser.AUTO,
        parent: stage,
        width: size,
        height: size,
        pixelArt: GAME_RENDER_CONFIG.PIXEL_ART,
        transparent: true,
        disableContextMenu: GAME_RENDER_CONFIG.DISABLE_CONTEXT_MENU,
        audio: { noAudio: true },
        input: {
            keyboard: false,
            mouse: false,
            touch: false,
            gamepad: false,
        },
        scene: [],
    });

/**
 * The photo of a map nobody is looking at, as a PNG. A map is drawn in a game
 * of its own, off the screen, photographed and torn down, so it works from the
 * data alone: the creation form uses it for a space that was not opened yet.
 * It gives up after `timeoutMs`, so a map that never finishes loading cannot
 * hold the caller.
 */
export const captureMapPreview = (
    map: GameMapData,
    timeoutMs: number = MAP_PREVIEW_CAPTURE.TIMEOUT_MS
): Promise<Blob> =>
    new Promise<Blob>((resolve, reject) => {
        const stage = createStage();
        const size = MAP_PREVIEW_CAPTURE.STAGE_SIZE;

        let game: Phaser.Game;
        try {
            game = createGame(stage, size);
        } catch (cause) {
            stage.remove();
            reject(cause);
            return;
        }

        // `destroy` of a booted game runs on the next animation frame, so in a
        // background tab the context is released when the tab comes back.
        // The timeout and the capture race: whoever comes second finds the
        // game gone.
        let finished = false;
        const finish = (settle: () => void) => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            destroyGameWhenReady(game);
            stage.remove();
            settle();
        };
        const timer = setTimeout(
            () =>
                finish(() =>
                    reject(new Error(MAP_PREVIEW_CAPTURE.TIMEOUT_MESSAGE))
                ),
            timeoutMs
        );

        game.scene.add(GAME_SCENE_KEYS.MAP, MapPreviewScene, true, {
            map,
            onDrawn: (scene: MapPreviewScene) => {
                try {
                    scene.captureThumbnail().then(
                        (blob) => finish(() => resolve(blob)),
                        (cause) => finish(() => reject(cause))
                    );
                } catch (cause) {
                    finish(() => reject(cause));
                }
            },
            onFailed: (cause: unknown) => finish(() => reject(cause)),
        });
    });
