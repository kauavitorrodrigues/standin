import Phaser from "phaser";
import { TILE_SIZE } from "@standin/contracts";
import { MAP_DRAG_THRESHOLD_PX } from "@/features/game/consts/camera";
import { CLICK_MOVE, TILE_CURSOR } from "@/features/game/consts/click-move";
import { getCellAt, isSameCell } from "@/features/game/utils/cell";
import type { Cell } from "@/features/game/types/cell";

type Point = { x: number; y: number };

type Params = {
    scene: Phaser.Scene;
    // Whether the tile under the mouse gets the mark: an avatar can stand on it
    // and it is not inside a desk or a named zone, which are outlined instead.
    // The point is where the mouse is, in world px.
    isMarkable: (cell: Cell, world: Point) => boolean;
    // Called with the tile and the point of a double click, whether the tile is
    // open or not: a closed one takes the avatar to the open tile closest to it.
    onDoubleClick: (cell: Cell, world: Point) => void;
};

// Marks the tile under the mouse with four corners over a faint fill, and
// reports a double click on it. It also keeps the mark on the tile the avatar
// is walking to. Like the hover of the desks it reads the pointer position
// instead of making anything interactive, so dragging the camera still works.
export class TileCursor {
    private readonly params: Params;
    private readonly graphics: Phaser.GameObjects.Graphics;
    private enabled = true;
    private isPointerOver = false;
    private hovered: Cell | null = null;
    private destination: Cell | null = null;
    // Where on the screen, in px, and when the last release was. The screen and
    // not the tile, since the camera follows the avatar and moves the map under
    // the mouse between the two clicks.
    private lastRelease: { x: number; y: number; time: number } | null = null;

    constructor(params: Params) {
        this.params = params;
        const { scene } = params;
        this.graphics = scene.add
            .graphics()
            .setDepth(TILE_CURSOR.DEPTH)
            .setVisible(false);

        scene.input.on(Phaser.Input.Events.GAME_OVER, this.handleOver);
        scene.input.on(Phaser.Input.Events.GAME_OUT, this.handleOut);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.handleOver);
        scene.input.on(Phaser.Input.Events.POINTER_UP, this.handleRelease);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // A disabled cursor shows no mark and hears no click, like while decorating.
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        this.lastRelease = null;
    }

    // The tile the avatar walks to, or null with no walk.
    setDestination(cell: Cell | null): void {
        this.destination = cell;
    }

    update(): void {
        this.hovered = this.findHoveredCell();
        const destination = this.enabled ? this.destination : null;

        this.graphics.clear();
        this.graphics.setVisible(this.hovered !== null || destination !== null);

        if (destination && !isSameCell(destination, this.hovered)) {
            this.drawFill(destination);
        }
        if (this.hovered) {
            this.drawFill(this.hovered);
            this.drawCorners(this.hovered);
        }
    }

    private destroy(): void {
        const { input } = this.params.scene;
        input.off(Phaser.Input.Events.GAME_OVER, this.handleOver);
        input.off(Phaser.Input.Events.GAME_OUT, this.handleOut);
        input.off(Phaser.Input.Events.POINTER_MOVE, this.handleOver);
        input.off(Phaser.Input.Events.POINTER_UP, this.handleRelease);
        this.graphics.destroy();
    }

    private handleOver = (): void => {
        this.isPointerOver = true;
    };

    private handleOut = (): void => {
        this.isPointerOver = false;
    };

    // Two quick releases on the same spot of the screen, with no drag between, are
    // the double click.
    private handleRelease = (pointer: Phaser.Input.Pointer): void => {
        if (!this.enabled) return;
        if (pointer.button !== 0) return;
        if (pointer.getDistance() >= MAP_DRAG_THRESHOLD_PX) {
            this.lastRelease = null;
            return;
        }

        const world = this.findPointedWorld();
        if (!world) {
            this.lastRelease = null;
            return;
        }

        const now = this.params.scene.time.now;
        const last = this.lastRelease;
        const isDouble =
            last !== null &&
            now - last.time <= CLICK_MOVE.DOUBLE_CLICK_MS &&
            Math.hypot(pointer.x - last.x, pointer.y - last.y) <=
                CLICK_MOVE.DOUBLE_CLICK_RADIUS_PX;
        if (!isDouble) {
            this.lastRelease = { x: pointer.x, y: pointer.y, time: now };
            return;
        }

        this.lastRelease = null;
        this.params.onDoubleClick(getCellAt(world), world);
    };

    // Where the mouse is on the map, in px, null when it is off the canvas.
    private findPointedWorld(): Point | null {
        if (!this.isPointerOver) return null;

        const { scene } = this.params;
        const { activePointer } = scene.input;
        return scene.cameras.main.getWorldPoint(
            activePointer.x,
            activePointer.y
        );
    }

    private findHoveredCell(): Cell | null {
        if (!this.enabled) return null;

        const world = this.findPointedWorld();
        if (!world) return null;

        const cell = getCellAt(world);
        return this.params.isMarkable(cell, world) ? cell : null;
    }

    // The faint fill, on the tile under the mouse and on the tile of a walk.
    private drawFill({ column, row }: Cell): void {
        this.graphics.fillStyle(TILE_CURSOR.FILL_COLOR, TILE_CURSOR.FILL_ALPHA);
        this.graphics.fillRect(
            column * TILE_SIZE,
            row * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        );
    }

    // The four corners, only on the tile under the mouse, so the tile of a
    // walk looks different from it.
    private drawCorners({ column, row }: Cell): void {
        const x = column * TILE_SIZE;
        const y = row * TILE_SIZE;
        const { graphics } = this;

        graphics.lineStyle(
            TILE_CURSOR.CORNER_LINE_WIDTH,
            TILE_CURSOR.CORNER_COLOR,
            TILE_CURSOR.CORNER_ALPHA
        );
        const near = TILE_CURSOR.CORNER_INSET_PX;
        const far = TILE_SIZE - TILE_CURSOR.CORNER_INSET_PX;
        const arm = TILE_CURSOR.CORNER_ARM_PX;
        // Each corner: the point on the tile and the way its two arms go.
        const corners = [
            { cx: x + near, cy: y + near, sx: 1, sy: 1 },
            { cx: x + far, cy: y + near, sx: -1, sy: 1 },
            { cx: x + near, cy: y + far, sx: 1, sy: -1 },
            { cx: x + far, cy: y + far, sx: -1, sy: -1 },
        ];
        corners.forEach(({ cx, cy, sx, sy }) => {
            graphics.beginPath();
            graphics.moveTo(cx + sx * arm, cy);
            graphics.lineTo(cx, cy);
            graphics.lineTo(cx, cy + sy * arm);
            graphics.strokePath();
        });
    }
}
