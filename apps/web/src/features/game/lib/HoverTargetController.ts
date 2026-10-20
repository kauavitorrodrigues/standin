import Phaser from "phaser";
import {
    MAP_CURSORS,
    MAP_DRAG_THRESHOLD_PX,
} from "@/features/game/consts/camera";
import { HOVER_OUTLINE } from "@/features/editor/consts/hover-outline";
import { drawObjectOutline } from "@/features/editor/utils/drawObjectOutline";
import type { HoverState, HoverTarget } from "@/features/game/types/hover";
import {
    findHoveredTarget,
    getHoverClickEvent,
    getHoverPinEvent,
    getHoverSelectEvent,
    getSelectedStateEvent,
    isSameHover,
    toHoverState,
} from "@/features/game/utils/hover";

// Outlines the target under the mouse with the same box the editor draws
// around an object, turns the cursor into a pointer, and tells the page which
// target it is and where it sits on the canvas, so the page can draw its card
// over it. It knows nothing about what a target is: desks and zones each feed
// their own targets and listen on their own event.
// Hit testing runs on the pointer position instead of making sprites
// interactive, so dragging the camera over a target keeps working.
export class HoverTargetController {
    private readonly scene: Phaser.Scene;
    private readonly event: string;
    // The local avatar is hovered for its cursor and click only, a box around
    // it would be noise.
    private readonly drawsOutline: boolean;
    private readonly outline: Phaser.GameObjects.Graphics;
    private targets: HoverTarget[] = [];
    // Off while the decorator is open, so a desk is a plain object to select.
    private enabled = true;
    private isPointerOver = false;
    // The target whose card the mouse is on, which keeps its outline.
    private pinnedId: string | null = null;
    // The target the page selected, outlined all the time.
    private selectedId: string | null = null;
    private last: HoverState | null = null;
    private lastSelected: HoverState | null = null;

    constructor(
        scene: Phaser.Scene,
        event: string,
        options: { drawsOutline: boolean } = { drawsOutline: true }
    ) {
        this.scene = scene;
        this.event = event;
        this.drawsOutline = options.drawsOutline;
        this.outline = scene.add
            .graphics()
            .setDepth(HOVER_OUTLINE.DEPTH)
            .setVisible(false);

        scene.input.on(Phaser.Input.Events.GAME_OVER, () => {
            this.isPointerOver = true;
        });
        scene.input.on(Phaser.Input.Events.GAME_OUT, () => {
            this.isPointerOver = false;
        });
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
            this.isPointerOver = true;
        });

        // A press and release that did not drag is a click, on the target
        // under the mouse or on the empty map (null).
        scene.input.on(
            Phaser.Input.Events.POINTER_UP,
            (pointer: Phaser.Input.Pointer) => {
                if (!this.enabled) return;
                if (pointer.getDistance() >= MAP_DRAG_THRESHOLD_PX) return;

                scene.game.events.emit(
                    getHoverClickEvent(this.event),
                    this.findPointedTarget()?.id ?? null
                );
            }
        );

        const pinEvent = getHoverPinEvent(event);
        const onPin = (id: string | null) => {
            this.pinnedId = id;
        };
        scene.game.events.on(pinEvent, onPin);

        const selectEvent = getHoverSelectEvent(event);
        const onSelect = (id: string | null) => {
            this.selectedId = id;
        };
        scene.game.events.on(selectEvent, onSelect);

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.game.events.off(pinEvent, onPin);
            scene.game.events.off(selectEvent, onSelect);
        });
    }

    // Swaps the targets for the ones of the objects now on the map. A target
    // that is gone stops being hovered, pinned or outlined on the next frame.
    setTargets(targets: HoverTarget[]): void {
        this.targets = targets;
    }

    // A disabled controller sees no target: nothing is hovered, outlined or
    // clicked, and the page is told once that the hover is gone.
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    update(): void {
        const target = this.findTargetUnderPointer();
        const hover = target
            ? toHoverState(target, this.scene.cameras.main)
            : null;

        this.drawOutlines(target);
        this.emitSelected();
        this.syncCursor(hover);
        this.emit(hover);
    }

    private findTargetUnderPointer(): HoverTarget | null {
        if (!this.enabled) return null;
        return this.findPointedTarget() ?? this.findPinnedTarget();
    }

    private findPinnedTarget(): HoverTarget | null {
        if (this.pinnedId === null) return null;

        return this.targets.find(({ id }) => id === this.pinnedId) ?? null;
    }

    private findPointedTarget(): HoverTarget | null {
        if (!this.isPointerOver) return null;

        const { activePointer } = this.scene.input;
        const world = this.scene.cameras.main.getWorldPoint(
            activePointer.x,
            activePointer.y
        );
        return findHoveredTarget(this.targets, world);
    }

    private findSelectedTarget(): HoverTarget | null {
        if (!this.enabled) return null;

        return this.targets.find(({ id }) => id === this.selectedId) ?? null;
    }

    // The selected target and the hovered one, which can be the same.
    private drawOutlines(hovered: HoverTarget | null): void {
        const selected = this.findSelectedTarget();
        if (!this.drawsOutline) return;

        const outlined = [selected, hovered].filter(
            (target): target is HoverTarget => target !== null
        );

        this.outline.clear();
        this.outline.setVisible(outlined.length > 0);
        outlined.forEach(({ bounds }) =>
            drawObjectOutline(this.outline, bounds)
        );
    }

    // Only on a change of target, so a drag in progress keeps its own cursor.
    private syncCursor(hover: HoverState | null): void {
        if (hover?.id === this.last?.id) return;

        this.scene.game.canvas.style.cursor = hover
            ? HOVER_OUTLINE.CURSOR
            : MAP_CURSORS.IDLE;
    }

    // Where the selected target is on the canvas, or null with none. Only a
    // change is emitted, like the hover.
    private emitSelected(): void {
        const selected = this.findSelectedTarget();
        const state = selected
            ? toHoverState(selected, this.scene.cameras.main)
            : null;
        if (isSameHover(this.lastSelected, state)) return;

        this.lastSelected = state;
        this.scene.game.events.emit(getSelectedStateEvent(this.event), state);
    }

    // Only a change is emitted, so a still camera over a still mouse is quiet.
    private emit(hover: HoverState | null): void {
        if (isSameHover(this.last, hover)) return;

        this.last = hover;
        this.scene.game.events.emit(this.event, hover);
    }
}
