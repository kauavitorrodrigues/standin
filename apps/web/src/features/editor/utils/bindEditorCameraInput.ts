import Phaser from "phaser";
import { EDITOR_CURSORS } from "@/features/editor/consts/camera";
import type { EditorCameraController } from "@/features/editor/lib/EditorCameraController";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import type { EditorPanState } from "@/features/editor/types/EditorPanState";
import { isPanMode } from "@/features/editor/utils/isPanMode";
import { isPanPointer } from "@/features/editor/utils/isPanPointer";
import { getWheelZoomFactor } from "@/utils/getWheelZoomFactor";
import { isSpaceKeyTarget } from "@/utils/isSpaceKeyTarget";

const SPACE_CODE = "Space";

// Wires the mouse and the space bar to the camera: the wheel moves the view up
// and down. With Ctrl it zooms smoothly toward the pointer, and with Shift it
// moves the view from side to side. A drag with the middle button, with space held or with the pan tool
// moves it too. Returns the function that
// removes every listener. `panState` is shared with the tool router, which
// reads whether space is held. Everything stays on the Phaser side, none of it
// goes through the state of React.
export const bindEditorCameraInput = (
    scene: Phaser.Scene,
    controller: EditorCameraController,
    store: EditorStore,
    panState: EditorPanState = { spaceHeld: false }
): (() => void) => {
    const canvas = scene.game.canvas;
    let dragging = false;

    const isPanning = () =>
        isPanMode({
            spaceHeld: panState.spaceHeld,
            tool: store.getState().tool,
        });

    const refreshCursor = () => {
        if (dragging) {
            canvas.style.cursor = EDITOR_CURSORS.PANNING;
            return;
        }
        if (isPanning()) {
            canvas.style.cursor = EDITOR_CURSORS.PAN;
            return;
        }
        canvas.style.cursor = EDITOR_CURSORS.IDLE;
    };

    const shouldDrag = (pointer: Phaser.Input.Pointer) => {
        return isPanPointer({
            button: pointer.button,
            leftDown: pointer.leftButtonDown(),
            spaceHeld: panState.spaceHeld,
            tool: store.getState().tool,
        });
    };

    const handleDown = (pointer: Phaser.Input.Pointer) => {
        if (!shouldDrag(pointer)) return;
        dragging = true;
        refreshCursor();
    };

    const handleMove = (pointer: Phaser.Input.Pointer) => {
        if (!dragging) return;
        controller.panBy(
            pointer.prevPosition.x - pointer.x,
            pointer.prevPosition.y - pointer.y
        );
    };

    const handleUp = () => {
        if (!dragging) return;
        dragging = false;
        refreshCursor();
    };

    const handleWheel = (pointer: Phaser.Input.Pointer) => {
        const event = pointer.event as WheelEvent;

        // Some browsers turn the wheel with Shift into a horizontal one already.
        if (event.ctrlKey || event.metaKey) {
            controller.zoomAt(getWheelZoomFactor(event), pointer.x, pointer.y);
            return;
        }
        if (event.shiftKey) {
            controller.panBy(event.deltaX || event.deltaY, 0);
            return;
        }

        controller.panBy(event.deltaX, event.deltaY);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code !== SPACE_CODE || isSpaceKeyTarget(event.target)) return;
        event.preventDefault();
        panState.spaceHeld = true;
        refreshCursor();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        if (event.code !== SPACE_CODE) return;
        panState.spaceHeld = false;
        refreshCursor();
    };

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, handleDown);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, handleMove);
    scene.input.on(Phaser.Input.Events.POINTER_UP, handleUp);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, handleUp);
    scene.input.on(Phaser.Input.Events.POINTER_WHEEL, handleWheel);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const unsubscribeStore = store.subscribe(refreshCursor);
    refreshCursor();

    return () => {
        scene.input.off(Phaser.Input.Events.POINTER_DOWN, handleDown);
        scene.input.off(Phaser.Input.Events.POINTER_MOVE, handleMove);
        scene.input.off(Phaser.Input.Events.POINTER_UP, handleUp);
        scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, handleUp);
        scene.input.off(Phaser.Input.Events.POINTER_WHEEL, handleWheel);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        unsubscribeStore();
    };
};
