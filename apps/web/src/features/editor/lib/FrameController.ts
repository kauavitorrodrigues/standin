import type Phaser from "phaser";
import { FRAME_MESSAGES } from "@/features/editor/consts/messages";
import type { FrameStore } from "@/features/editor/lib/FrameStore";
import type { FrameGrab } from "@/features/editor/types/frame-grab";
import type { FrameDrag } from "@/features/editor/types/frame-drag";
import type { FrameLimits } from "@/features/editor/types/frame-limits";
import type { PointerInterceptor } from "@/features/editor/types/PointerInterceptor";
import type { ToolPointerInput } from "@/features/editor/types/ToolInput";
import type { TileRect } from "@/features/editor/types/tile-rect";
import { clampCell } from "@/features/editor/utils/clampCell";
import { getFrameCursor } from "@/features/editor/utils/getFrameCursor";
import { hitTestFrame } from "@/features/editor/utils/hitTestFrame";
import { moveFrameRect } from "@/features/editor/utils/moveFrameRect";
import { resizeFrameRect } from "@/features/editor/utils/resizeFrameRect";

type PointerPoint = Pick<ToolPointerInput, "worldX" | "worldY">;

type Options = {
    scene: Phaser.Scene;
    store: FrameStore;
    limits: FrameLimits;
    columns: number;
    rows: number;
    // Whether the editor takes edits now, the same rule the tools follow.
    isEditable: () => boolean;
    // Whether a drag inside the frame moves it: the pan tool or space held. With
    // any other tool the inside belongs to the tool.
    canMoveFromBody: () => boolean;
    // Called when a press takes a handle or an edge to resize the frame.
    onResizeStart: () => void;
    onHint: (text: string | null) => void;
};

// Drags the frame of an area by its edges, its corners and, while panning, its inside. It takes
// the press before the active tool, so the frame works whatever the tool is.
// The frame follows the pointer live, snapped to tiles, and Esc puts it back
// where the drag began. A drag is not an edit of the draft, so it is not on the
// undo stack.
export class FrameController implements PointerInterceptor {
    private readonly options: Options;
    private drag: FrameDrag | null = null;
    private restoreCursor: string | null = null;

    constructor(options: Options) {
        this.options = options;
    }

    press = (input: ToolPointerInput): boolean => {
        if (!this.options.isEditable() || input.button !== 0) return false;

        const start = this.options.store.getRect();
        const grab = hitTestFrame({
            rect: start,
            worldX: input.worldX,
            worldY: input.worldY,
            zoom: this.options.scene.cameras.main.zoom,
            body: this.options.canMoveFromBody(),
        });
        if (!grab) return false;

        // The tool changes first: that rewrites the cursor of the canvas, and the
        // cursor of the grab has to be the one that stays.
        if (grab !== "move") this.options.onResizeStart();
        this.showCursor(grab);

        this.drag = { grab, start, from: this.getCell(input) };
        this.options.onHint(FRAME_MESSAGES.size(start.w, start.h));
        return true;
    };

    move = (input: ToolPointerInput): void => {
        const drag = this.drag;
        if (!drag) return;

        const rect = this.getRect(drag, input);
        this.options.store.setRect(rect);
        this.options.onHint(FRAME_MESSAGES.size(rect.w, rect.h));
    };

    release = (input: ToolPointerInput): void => {
        const drag = this.drag;
        if (!drag) return;

        this.move(input);
        this.end();
    };

    isOver = (input: PointerPoint): boolean => this.getGrab(input) !== null;

    hover = (input: ToolPointerInput): void => {
        this.showCursor(this.getGrab(input));
    };

    cancel = (): void => {
        const drag = this.drag;
        if (!drag) return;

        this.options.store.setRect(drag.start);
        this.end();
    };

    // The scene is going away, so there is no cursor left to put back.
    destroy = (): void => {
        this.drag = null;
        this.options.onHint(null);
    };

    private end(): void {
        this.drag = null;
        this.options.onHint(null);
        this.showCursor(null);
    }

    private getGrab(input: PointerPoint): FrameGrab | null {
        if (!this.options.isEditable()) return null;

        return hitTestFrame({
            rect: this.options.store.getRect(),
            worldX: input.worldX,
            worldY: input.worldY,
            zoom: this.options.scene.cameras.main.zoom,
            body: this.options.canMoveFromBody(),
        });
    }

    // Writes the cursor of the grab on the canvas, which is where the tools and
    // the camera write theirs. The one that was there is kept and put back when
    // the pointer leaves the frame.
    private showCursor(grab: FrameGrab | null): void {
        const canvas = this.options.scene.game.canvas;
        if (!grab) {
            if (this.restoreCursor === null) return;
            canvas.style.cursor = this.restoreCursor;
            this.restoreCursor = null;
            return;
        }

        this.restoreCursor ??= canvas.style.cursor;
        canvas.style.cursor = getFrameCursor(grab);
    }

    private getCell(input: ToolPointerInput) {
        return clampCell(
            input.worldX,
            input.worldY,
            this.options.columns,
            this.options.rows
        );
    }

    private getRect(drag: FrameDrag, input: ToolPointerInput): TileRect {
        const cell = this.getCell(input);
        const { columns, rows, limits } = this.options;

        switch (drag.grab) {
            case "move":
                return moveFrameRect({
                    rect: drag.start,
                    from: drag.from,
                    cell,
                    columns,
                    rows,
                });
            default:
                return resizeFrameRect({
                    rect: drag.start,
                    handle: drag.grab,
                    cell,
                    columns,
                    rows,
                    limits,
                });
        }
    }
}
