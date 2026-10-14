import Phaser from "phaser";
import type { ToolInputSource } from "@/features/editor/types/ToolInput";
import { isSpaceKeyTarget } from "@/utils/isSpaceKeyTarget";

const ESCAPE_KEY = "Escape";

// The Phaser side of the tool router: turns the pointer of the scene into
// plain events with the world position, and Esc into a cancel. The world
// position is read from the camera at the time of the event.
export const bindToolInput = (scene: Phaser.Scene): ToolInputSource => {
    return (handlers) => {
        const read = (pointer: Phaser.Input.Pointer) => {
            const world = scene.cameras.main.getWorldPoint(
                pointer.x,
                pointer.y
            );
            const event = pointer.event as Partial<MouseEvent> | undefined;
            return {
                worldX: world.x,
                worldY: world.y,
                button: pointer.button,
                leftDown: pointer.leftButtonDown(),
                alt: event?.altKey === true,
                shift: event?.shiftKey === true,
                ctrl: event?.ctrlKey === true || event?.metaKey === true,
            };
        };

        const handleDown = (pointer: Phaser.Input.Pointer) =>
            handlers.down(read(pointer));
        const handleMove = (pointer: Phaser.Input.Pointer) =>
            handlers.move(read(pointer));
        const handleUp = (pointer: Phaser.Input.Pointer) =>
            handlers.up(read(pointer));
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== ESCAPE_KEY || isSpaceKeyTarget(event.target)) {
                return;
            }
            handlers.cancel();
        };

        const { input } = scene;
        input.on(Phaser.Input.Events.POINTER_DOWN, handleDown);
        input.on(Phaser.Input.Events.POINTER_MOVE, handleMove);
        input.on(Phaser.Input.Events.POINTER_UP, handleUp);
        input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, handleUp);
        input.on(Phaser.Input.Events.GAME_OUT, handlers.leave);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            input.off(Phaser.Input.Events.POINTER_DOWN, handleDown);
            input.off(Phaser.Input.Events.POINTER_MOVE, handleMove);
            input.off(Phaser.Input.Events.POINTER_UP, handleUp);
            input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, handleUp);
            input.off(Phaser.Input.Events.GAME_OUT, handlers.leave);
            window.removeEventListener("keydown", handleKeyDown);
        };
    };
};
