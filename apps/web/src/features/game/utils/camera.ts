import Phaser from "phaser";
import { CAMERA_EVENTS, MAP_DRAG_CURSORS } from "@/features/game/consts/camera";
import { getMapScene } from "@/features/game/utils/map";
import type { MapCameraController } from "@/features/game/lib/MapCameraController";
import type { CameraState } from "@/features/game/types/game";

export const getMapCameraController = (
    game: Phaser.Game
): MapCameraController | null => getMapScene(game)?.cameraController ?? null;

export const bindCameraStateSubscription = (
    game: Phaser.Game,
    listener: (state: CameraState) => void
): (() => void) => {
    game.events.on(CAMERA_EVENTS.STATE_CHANGED, listener);

    const controller = getMapCameraController(game);
    if (controller) listener(controller.getState());

    return () => game.events.off(CAMERA_EVENTS.STATE_CHANGED, listener);
};

export const bindMapDragPan = (
    scene: Phaser.Scene,
    controller: MapCameraController
): void => {
    const canvas = scene.game.canvas;
    canvas.style.cursor = MAP_DRAG_CURSORS.IDLE;

    scene.input.on(
        Phaser.Input.Events.POINTER_DOWN,
        (pointer: Phaser.Input.Pointer) => {
            if (!pointer.leftButtonDown()) return;

            canvas.style.cursor = MAP_DRAG_CURSORS.DRAGGING;
        }
    );

    scene.input.on(Phaser.Input.Events.POINTER_UP, () => {
        canvas.style.cursor = MAP_DRAG_CURSORS.IDLE;
    });

    scene.input.on(
        Phaser.Input.Events.POINTER_MOVE,
        (pointer: Phaser.Input.Pointer) => {
            if (!pointer.leftButtonDown()) return;

            controller.stopFollow();
            controller.pan(
                pointer.x - pointer.prevPosition.x,
                pointer.y - pointer.prevPosition.y
            );
        }
    );
};
