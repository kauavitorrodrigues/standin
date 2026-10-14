import { describe, expect, it, vi } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import { FrameController } from "@/features/editor/lib/FrameController";
import { createFrameStore } from "@/features/editor/lib/FrameStore";
import type { ToolPointerInput } from "@/features/editor/types/ToolInput";

const at = (
    cellX: number,
    cellY: number,
    extra: Partial<ToolPointerInput> = {}
): ToolPointerInput => ({
    worldX: cellX * TILE_SIZE,
    worldY: cellY * TILE_SIZE,
    button: 0,
    leftDown: true,
    alt: false,
    shift: false,
    ctrl: false,
    ...extra,
});

const setup = (editable = true, canMoveFromBody = true) => {
    const onResizeStart = vi.fn();
    const store = createFrameStore({ x: 0, y: 0, w: 12, h: 8 });
    const canvas = { style: { cursor: "crosshair" } };
    const hints: (string | null)[] = [];
    const controller = new FrameController({
        scene: {
            cameras: { main: { zoom: 1 } },
            game: { canvas },
        } as never,
        store,
        limits: { minSize: 2, maxWidth: 40, maxHeight: 30 },
        columns: 40,
        rows: 30,
        isEditable: () => editable,
        canMoveFromBody: () => canMoveFromBody,
        onResizeStart,
        onHint: (text) => hints.push(text),
    });
    return { store, controller, hints, canvas, onResizeStart };
};

describe("FrameController", () => {
    it("resizes the frame live while an edge is dragged", () => {
        const { store, controller } = setup();

        expect(controller.press(at(12, 4))).toBe(true);
        controller.move(at(17, 4));
        expect(store.getRect()).toEqual({ x: 0, y: 0, w: 18, h: 8 });

        controller.release(at(20, 4));
        expect(store.getRect()).toEqual({ x: 0, y: 0, w: 21, h: 8 });
    });

    it("asks for the resize tool on a handle, but not when moving the frame", () => {
        const { controller, onResizeStart } = setup();

        controller.press(at(3, 3));
        controller.release(at(3, 3));
        expect(onResizeStart).not.toHaveBeenCalled();

        controller.press(at(12, 4));
        expect(onResizeStart).toHaveBeenCalledTimes(1);
    });

    it("moves the whole frame by its inside while panning", () => {
        const { store, controller } = setup();

        expect(controller.press(at(3, 3))).toBe(true);
        controller.move(at(9, 8));
        controller.release(at(9, 8));

        expect(store.getRect()).toEqual({ x: 6, y: 5, w: 12, h: 8 });
    });

    it("leaves the inside to the tool when not panning", () => {
        const { store, controller } = setup(true, false);

        expect(controller.press(at(6, 4))).toBe(false);
        controller.move(at(9, 9));
        expect(store.getRect()).toEqual({ x: 0, y: 0, w: 12, h: 8 });
    });

    it("does not take the press when the editor is not editable", () => {
        const { controller } = setup(false);
        expect(controller.press(at(12, 4))).toBe(false);
    });

    it("ignores other buttons than the main one", () => {
        const { controller } = setup();
        expect(controller.press(at(12, 4, { button: 2 }))).toBe(false);
    });

    it("puts the frame back where the drag began on cancel", () => {
        const { store, controller } = setup();

        controller.press(at(12, 4));
        controller.move(at(25, 4));
        controller.cancel();

        expect(store.getRect()).toEqual({ x: 0, y: 0, w: 12, h: 8 });
    });

    it("keeps following the pointer past the canvas and stops at the maximum", () => {
        const { store, controller } = setup();

        controller.press(at(12, 4));
        controller.move(at(90, 4, { worldY: 4 * TILE_SIZE }));

        expect(store.getRect()).toEqual({ x: 0, y: 0, w: 40, h: 8 });
    });

    it("says the size under the canvas while dragging and clears it at the end", () => {
        const { controller, hints } = setup();

        controller.press(at(12, 4));
        controller.move(at(15, 4));
        controller.release(at(15, 4));

        expect(hints).toContain("16 x 8 tiles");
        expect(hints.at(-1)).toBeNull();
    });

    it("shows the cursor of what a press would grab and puts the old one back", () => {
        const { controller, canvas } = setup(true, false);

        controller.hover(at(12, 4));
        expect(canvas.style.cursor).toBe("ew-resize");
        expect(controller.isOver(at(12, 4))).toBe(true);

        controller.hover(at(6, 4));
        expect(canvas.style.cursor).toBe("crosshair");
        expect(controller.isOver(at(6, 4))).toBe(false);
    });
});
