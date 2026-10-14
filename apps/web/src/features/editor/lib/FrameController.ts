import type Phaser from "phaser";
import { FRAME_MESSAGES } from "@/features/editor/consts/messages";
import type { FrameStore } from "@/features/editor/lib/FrameStore";
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

type Options = {
    scene: Phaser.Scene;
    store: FrameStore;
    limits: FrameLimits;
    columns: number;
    rows: number;
    // Whether the editor takes edits now, the same rule the tools follow.
    isEditable: () => boolean;
    onHint: (text: string | null) => void;
};

// Drags the frame of an area by its edges, its corners and its grip. It takes
// the press before the active tool, so the frame works whatever the tool is.
// The frame follows the pointer live, snapped to tiles, and Esc puts it back
// where the drag began. A drag is not an edit of the draft, so it is not on the
// undo stack.
export class FrameController implements PointerInterceptor {
    private readonly options: Options;
    private drag: FrameDrag | null = null;

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
        });
        if (!grab) return false;

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

    hover = (input: ToolPointerInput): void => {
        const grab = this.options.isEditable()
            ? hitTestFrame({
                  rect: this.options.store.getRect(),
                  worldX: input.worldX,
                  worldY: input.worldY,
                  zoom: this.options.scene.cameras.main.zoom,
              })
            : null;
        this.options.scene.input.setDefaultCursor(getFrameCursor(grab));
    };

    cancel = (): void => {
        const drag = this.drag;
        if (!drag) return;

        this.options.store.setRect(drag.start);
        this.end();
    };

    destroy = (): void => {
        this.end();
    };

    private end(): void {
        this.drag = null;
        this.options.onHint(null);
        this.options.scene.input.setDefaultCursor(getFrameCursor(null));
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
