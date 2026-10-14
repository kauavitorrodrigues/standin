import Phaser from "phaser";
import { TILE_SIZE } from "@standin/contracts";
import { EDITOR_FRAME } from "@/features/editor/consts/frame";
import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { FrameStore } from "@/features/editor/lib/FrameStore";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";
import type { TileRect } from "@/features/editor/types/tile-rect";
import { createObjectLookup } from "@/features/editor/utils/createObjectLookup";
import { createSceneObjectSurface } from "@/features/editor/utils/createSceneObjectSurface";
import { findCrossingObjectIds } from "@/features/editor/utils/findCrossingObjectIds";
import { getObjectBounds } from "@/features/editor/utils/getObjectBounds";
import { getZoneHandlePoints } from "@/features/editor/utils/getZoneHandlePoints";

const HALF = 2;

// The frame of an area over the canvas: the dim over everything outside it,
// its border with the 8 handles and the move grip, and a red mark over every
// object the border cuts. It redraws when the frame or the draft changes, or a
// texture arrives (the mark follows the sprite size), never on a pointer move.
export class FrameOverlay {
    private readonly scene: Phaser.Scene;
    private readonly store: FrameStore;
    private readonly draftStore: DraftStore;
    private readonly surface: ObjectSurface;
    private readonly columns: number;
    private readonly rows: number;
    private readonly dim: Phaser.GameObjects.Graphics;
    private readonly marks: Phaser.GameObjects.Graphics;
    private readonly border: Phaser.GameObjects.Graphics;
    private readonly unsubscribers: (() => void)[] = [];

    constructor(
        scene: Phaser.Scene,
        store: FrameStore,
        draftStore: DraftStore,
        columns: number,
        rows: number
    ) {
        this.scene = scene;
        this.store = store;
        this.draftStore = draftStore;
        this.columns = columns;
        this.rows = rows;
        this.surface = createSceneObjectSurface(scene);
        this.dim = scene.add.graphics().setDepth(EDITOR_FRAME.DIM_DEPTH);
        this.marks = scene.add.graphics().setDepth(EDITOR_FRAME.MARK_DEPTH);
        this.border = scene.add.graphics().setDepth(EDITOR_FRAME.BORDER_DEPTH);

        this.unsubscribers.push(
            store.subscribe(this.redraw),
            draftStore.subscribe(this.redraw)
        );
        scene.textures.on(Phaser.Textures.Events.ADD, this.redraw);
        this.redraw();
    }

    destroy(): void {
        this.unsubscribers.forEach((unsubscribe) => unsubscribe());
        this.unsubscribers.length = 0;
        this.scene.textures?.off(Phaser.Textures.Events.ADD, this.redraw);
        this.dim.destroy();
        this.marks.destroy();
        this.border.destroy();
    }

    private redraw = (): void => {
        const rect = this.store.getRect();
        this.drawDim(rect);
        this.drawMarks(rect);
        this.drawBorder(rect);
    };

    private drawDim(rect: TileRect): void {
        const width = this.columns * TILE_SIZE;
        const height = this.rows * TILE_SIZE;
        const left = rect.x * TILE_SIZE;
        const top = rect.y * TILE_SIZE;
        const right = left + rect.w * TILE_SIZE;
        const bottom = top + rect.h * TILE_SIZE;

        this.dim.clear();
        this.dim.fillStyle(EDITOR_FRAME.DIM_COLOR, EDITOR_FRAME.DIM_ALPHA);
        this.dim.fillRect(0, 0, width, top);
        this.dim.fillRect(0, bottom, width, height - bottom);
        this.dim.fillRect(0, top, left, bottom - top);
        this.dim.fillRect(right, top, width - right, bottom - top);
    }

    private drawMarks(rect: TileRect): void {
        this.marks.clear();

        const model = this.draftStore.getState().draft;
        const ids = findCrossingObjectIds(model, rect);
        if (ids.length === 0) return;

        const lookup = createObjectLookup(model);
        this.marks.fillStyle(
            EDITOR_FRAME.CUT_COLOR,
            EDITOR_FRAME.CUT_FILL_ALPHA
        );
        this.marks.lineStyle(
            EDITOR_FRAME.CUT_LINE_WIDTH,
            EDITOR_FRAME.CUT_COLOR,
            1
        );

        for (const id of ids) {
            const placed = lookup.placedById.get(id);
            if (!placed) continue;

            const bounds = getObjectBounds(placed, lookup, this.surface);
            if (!bounds) continue;

            this.marks.fillRect(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height
            );
            this.marks.strokeRect(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height
            );
        }
    }

    private drawBorder(rect: TileRect): void {
        this.border.clear();
        this.border.lineStyle(
            EDITOR_FRAME.BORDER_WIDTH,
            EDITOR_FRAME.BORDER_COLOR,
            1
        );
        this.border.strokeRect(
            rect.x * TILE_SIZE,
            rect.y * TILE_SIZE,
            rect.w * TILE_SIZE,
            rect.h * TILE_SIZE
        );

        const size = EDITOR_FRAME.HANDLE_SIZE;
        this.border.fillStyle(EDITOR_FRAME.HANDLE_FILL, 1);
        this.border.lineStyle(
            EDITOR_FRAME.HANDLE_STROKE_WIDTH,
            EDITOR_FRAME.HANDLE_STROKE,
            1
        );
        for (const point of Object.values(getZoneHandlePoints(rect))) {
            this.border.fillRect(
                point.x - size / HALF,
                point.y - size / HALF,
                size,
                size
            );
            this.border.strokeRect(
                point.x - size / HALF,
                point.y - size / HALF,
                size,
                size
            );
        }

        this.drawGrip(rect);
    }

    // Four short strokes in the corner of the frame, the grip that moves it.
    private drawGrip(rect: TileRect): void {
        const left = rect.x * TILE_SIZE + EDITOR_FRAME.GRIP_INSET;
        const top = rect.y * TILE_SIZE + EDITOR_FRAME.GRIP_INSET;
        const size = EDITOR_FRAME.GRIP_SIZE;

        this.border.fillStyle(EDITOR_FRAME.BORDER_COLOR, 1);
        this.border.fillRect(left, top, size, size);
        this.border.lineStyle(2, EDITOR_FRAME.HANDLE_STROKE, 1);
        this.border.lineBetween(
            left + 3,
            top + size / HALF,
            left + size - 3,
            top + size / HALF
        );
        this.border.lineBetween(
            left + size / HALF,
            top + 3,
            left + size / HALF,
            top + size - 3
        );
    }
}
