import Phaser from "phaser";
import {
    CAMERA_EVENTS,
    MAP_DRAG_CURSORS,
    MAP_DRAG_THRESHOLD_PX,
} from "@/features/game/consts/camera";
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

// `canPan` can hold the camera still for a press, such as one that drags an
// object while decorating. It is asked on every move of the press.
export const bindMapDragPan = (
    scene: Phaser.Scene,
    controller: MapCameraController,
    canPan: () => boolean = () => true
): void => {
    const canvas = scene.game.canvas;
    canvas.style.cursor = MAP_DRAG_CURSORS.IDLE;
    let isDragging = false;

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
        isDragging = false;
    });

    scene.input.on(Phaser.Input.Events.POINTER_UP, () => {
        isDragging = false;
        canvas.style.cursor = MAP_DRAG_CURSORS.IDLE;
    });

    scene.input.on(
        Phaser.Input.Events.POINTER_MOVE,
        (pointer: Phaser.Input.Pointer) => {
            if (!pointer.leftButtonDown()) return;
            if (!canPan()) return;

            // A press that has not moved past the threshold is still a click.
            if (!isDragging) {
                if (pointer.getDistance() < MAP_DRAG_THRESHOLD_PX) return;

                isDragging = true;
                canvas.style.cursor = MAP_DRAG_CURSORS.DRAGGING;
            }

            controller.stopFollow();
            controller.pan(
                pointer.x - pointer.prevPosition.x,
                pointer.y - pointer.prevPosition.y
            );
        }
    );
};
