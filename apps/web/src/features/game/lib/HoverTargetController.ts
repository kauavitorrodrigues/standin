import Phaser from "phaser";
import {
    MAP_CURSORS,
    MAP_DRAG_THRESHOLD_PX,
} from "@/features/game/consts/camera";
import { getCursorClaims } from "@/features/game/utils/CursorClaims";
import { HOVER_OUTLINE } from "@/features/editor/consts/hover-outline";
import { drawObjectOutline } from "@/features/editor/utils/drawObjectOutline";
import type { HoverState, HoverTarget } from "@/features/game/types/hover";
import {
    copyHoverState,
    findHoveredTarget,
    findTargetById,
    getHoverClickEvent,
    getHoverPinEvent,
    getHoverSelectEvent,
    getSelectedStateEvent,
    isSameHover,
    writeHoverState,
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
    // A zone is outlined and named but leaves the cursor as the arrow.
    private readonly setsCursor: boolean;
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
    // Reused by every frame, so a still mouse over a target builds nothing.
    // `last` and `lastSelected` are copies, since they are handed to the page.
    private readonly hoverScratch: HoverState = {
        id: "",
        screen: { x: 0, y: 0, width: 0, height: 0 },
    };
    private readonly selectedScratch: HoverState = {
        id: "",
        screen: { x: 0, y: 0, width: 0, height: 0 },
    };
    private readonly worldPoint = new Phaser.Math.Vector2();

    constructor(
        scene: Phaser.Scene,
        event: string,
        options: { drawsOutline: boolean; setsCursor: boolean } = {
            drawsOutline: true,
            setsCursor: true,
        }
    ) {
        this.scene = scene;
        this.event = event;
        this.drawsOutline = options.drawsOutline;
        this.setsCursor = options.setsCursor;
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
        const { main: camera } = this.scene.cameras;
        const target = this.findTargetUnderPointer();
        const selected = this.findSelectedTarget();
        const hover = target
            ? writeHoverState(target, camera, this.hoverScratch)
            : null;

        this.drawOutlines(selected, target);
        this.emitSelected(selected);
        this.syncCursor(hover);
        this.emit(hover);
    }

    private findTargetUnderPointer(): HoverTarget | null {
        if (!this.enabled) return null;
        return this.findPointedTarget() ?? this.findPinnedTarget();
    }

    private findPinnedTarget(): HoverTarget | null {
        return findTargetById(this.targets, this.pinnedId);
    }

    private findPointedTarget(): HoverTarget | null {
        if (!this.isPointerOver) return null;

        const { activePointer } = this.scene.input;
        const world = this.scene.cameras.main.getWorldPoint(
            activePointer.x,
            activePointer.y,
            this.worldPoint
        );
        return findHoveredTarget(this.targets, world);
    }

    private findSelectedTarget(): HoverTarget | null {
        if (!this.enabled) return null;

        return findTargetById(this.targets, this.selectedId);
    }

    // The selected target and the hovered one, which can be the same.
    private drawOutlines(
        selected: HoverTarget | null,
        hovered: HoverTarget | null
    ): void {
        if (!this.drawsOutline) return;

        this.outline.clear();
        this.outline.setVisible(selected !== null || hovered !== null);
        if (selected) drawObjectOutline(this.outline, selected.bounds);
        if (hovered) drawObjectOutline(this.outline, hovered.bounds);
    }

    // Only on a change of target, so a drag in progress keeps its own cursor. The
    // pointer is shared with the other controllers of the canvas (CursorClaims).
    private syncCursor(hover: HoverState | null): void {
        if (!this.setsCursor) return;
        if (hover?.id === this.last?.id) return;

        const { canvas } = this.scene.game;
        const isPointer = getCursorClaims(canvas).claim(this, hover !== null);
        canvas.style.cursor = isPointer
            ? HOVER_OUTLINE.CURSOR
            : MAP_CURSORS.IDLE;
    }

    // Where the selected target is on the canvas, or null with none. Only a
    // change is emitted, like the hover.
    private emitSelected(selected: HoverTarget | null): void {
        const state = this.writeSelectedState(selected);
        if (isSameHover(this.lastSelected, state)) return;

        this.lastSelected = state ? copyHoverState(state) : null;
        this.scene.game.events.emit(
            getSelectedStateEvent(this.event),
            this.lastSelected
        );
    }

    private writeSelectedState(
        selected: HoverTarget | null
    ): HoverState | null {
        if (!selected) return null;

        return writeHoverState(
            selected,
            this.scene.cameras.main,
            this.selectedScratch
        );
    }

    // Only a change is emitted, so a still camera over a still mouse is quiet.
    private emit(hover: HoverState | null): void {
        if (isSameHover(this.last, hover)) return;

        this.last = hover ? copyHoverState(hover) : null;
        this.scene.game.events.emit(this.event, this.last);
    }
}
