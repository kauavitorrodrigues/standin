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

const setup = (editable = true) => {
    const store = createFrameStore({ x: 0, y: 0, w: 12, h: 8 });
    const setDefaultCursor = vi.fn();
    const hints: (string | null)[] = [];
    const controller = new FrameController({
        scene: {
            cameras: { main: { zoom: 1 } },
            input: { setDefaultCursor },
        } as never,
        store,
        limits: { minSize: 2, maxWidth: 40, maxHeight: 30 },
        columns: 40,
        rows: 30,
        isEditable: () => editable,
        onHint: (text) => hints.push(text),
    });
    return { store, controller, hints, setDefaultCursor };
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

    it("moves the whole frame by its grip", () => {
        const { store, controller } = setup();

        expect(controller.press(at(0, 0, { worldX: 12, worldY: 12 }))).toBe(
            true
        );
        controller.move(
            at(6, 5, { worldX: 6 * TILE_SIZE + 12, worldY: 5 * TILE_SIZE + 12 })
        );
        controller.release(
            at(6, 5, { worldX: 6 * TILE_SIZE + 12, worldY: 5 * TILE_SIZE + 12 })
        );

        expect(store.getRect()).toEqual({ x: 6, y: 5, w: 12, h: 8 });
    });

    it("does not take a press away from the frame", () => {
        const { store, controller } = setup();

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

    it("shows the cursor of what a press would grab", () => {
        const { controller, setDefaultCursor } = setup();

        controller.hover(at(12, 4));
        expect(setDefaultCursor).toHaveBeenLastCalledWith("ew-resize");

        controller.hover(at(6, 4));
        expect(setDefaultCursor).toHaveBeenLastCalledWith("default");
    });
});
