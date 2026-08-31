import Phaser from "phaser";
import {
    WHEEL_ZOOM_DIRECTIONS,
    type WheelZoomDirection,
} from "@/features/game/consts/camera";
import type { MapCameraController } from "@/features/game/lib/MapCameraController";

export const resolveClampedZoom = (
    currentZoom: number,
    delta: number,
    minZoom: number,
    maxZoom: number
): number => Math.min(Math.max(currentZoom + delta, minZoom), maxZoom);

export const resolveWheelZoomDirection = (
    deltaY: number
): WheelZoomDirection => {
    switch (Math.sign(deltaY)) {
    case WHEEL_ZOOM_DIRECTIONS.IN:
        return WHEEL_ZOOM_DIRECTIONS.IN;
    case WHEEL_ZOOM_DIRECTIONS.OUT:
        return WHEEL_ZOOM_DIRECTIONS.OUT;
    default:
        return WHEEL_ZOOM_DIRECTIONS.NEUTRAL;
    }
};

export const applyWheelZoom = (
    controller: MapCameraController,
    direction: WheelZoomDirection
): void => {
    switch (direction) {
    case WHEEL_ZOOM_DIRECTIONS.IN:
        controller.zoomIn();
        return;
    case WHEEL_ZOOM_DIRECTIONS.OUT:
        controller.zoomOut();
        return;
    case WHEEL_ZOOM_DIRECTIONS.NEUTRAL:
        return;
    }
};

export const bindMapWheelZoom = (
    scene: Phaser.Scene,
    controller: MapCameraController
): void => {
    scene.input.on(
        Phaser.Input.Events.POINTER_WHEEL,
        (
            _pointer: Phaser.Input.Pointer,
            _currentlyOver: Phaser.GameObjects.GameObject[],
            _deltaX: number,
            deltaY: number
        ) => {
            applyWheelZoom(controller, resolveWheelZoomDirection(deltaY));
        }
    );
};
