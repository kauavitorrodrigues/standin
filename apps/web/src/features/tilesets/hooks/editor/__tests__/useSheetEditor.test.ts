import { useState, type PointerEvent } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { TileMeta } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useTileSheetEditor } from "../useSheetEditor";
import { getTilesetGrid } from "../../../utils/grid/getGrid";

afterEach(unmountAllHooks);

// 4 columns and 2 rows. At the default zoom (3x) a tile is 96 px wide.
const grid = getTilesetGrid({ w: 128, h: 64 }, 0, 0)!;
const TILE_PX = 96;

const at = (index: number) => ({
    clientX: (index % 4) * TILE_PX + 10,
    clientY: Math.floor(index / 4) * TILE_PX + 10,
});

const pointer = (
    index: number,
    extra: { shiftKey?: boolean; ctrlKey?: boolean } = {}
): PointerEvent<HTMLElement> =>
    ({
        ...at(index),
        pointerId: 1,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        ...extra,
        currentTarget: {
            getBoundingClientRect: () => ({ left: 0, top: 0 }),
            setPointerCapture: () => undefined,
        },
    }) as unknown as PointerEvent<HTMLElement>;

// A digit is pressed on the number row unless the code says otherwise.
const press = (
    key: string,
    code = /^\d$/.test(key) ? `Digit${key}` : "",
    init: KeyboardEventInit = {}
) => window.dispatchEvent(new KeyboardEvent("keydown", { key, code, ...init }));

const setup = (
    initial: TileMeta = {},
    options: {
        savedMeta?: TileMeta | null;
        imageInUse?: boolean;
        // The editor opens with the hand. The tests start from the selection
        // tool unless they are about how it opens.
        keepOpeningTool?: boolean;
    } = {}
) => {
    const harness = renderHook(() => {
        const [meta, setMeta] = useState<TileMeta>(initial);
        const editor = useTileSheetEditor({
            grid,
            meta,
            onChange: setMeta,
            savedMeta: options.savedMeta ?? null,
            imageInUse: options.imageInUse ?? false,
            disabled: false,
        });
        return { meta, editor };
    });
    const { result, act } = harness;
    const down = (
        index: number,
        extra?: { shiftKey?: boolean; ctrlKey?: boolean }
    ) =>
        act(() =>
            result.current.editor.pointerHandlers.onPointerDown(
                pointer(index, extra)
            )
        );
    const move = (index: number) =>
        act(() =>
            result.current.editor.pointerHandlers.onPointerMove(pointer(index))
        );
    const up = () =>
        act(() => result.current.editor.pointerHandlers.onPointerUp());
    const key = (value: string, code?: string, init?: KeyboardEventInit) =>
        act(() => press(value, code, init));
    if (!options.keepOpeningTool) {
        act(() => result.current.editor.setTool("select"));
    }
    return { result, act, down, move, up, key };
};

describe("useTileSheetEditor", () => {
    it("opens with the hand, which does not select or paint", () => {
        const { result, down, up } = setup({}, { keepOpeningTool: true });
        expect(result.current.editor.tool).toBe("pan");
        down(0);
        up();
        expect(result.current.editor.selected).toEqual([]);
        expect(result.current.meta).toEqual({});
    });

    it("selects the tile under the pointer", () => {
        const { result, down } = setup();
        down(5);
        expect(result.current.editor.selected).toEqual([5]);
        expect(result.current.editor.single).toBe(5);
    });

    it("selects the rectangle of a drag", () => {
        const { result, down, move, up } = setup();
        down(0);
        move(5);
        up();
        expect(result.current.editor.selected.sort()).toEqual([0, 1, 4, 5]);
    });

    it("adds to the selection with shift", () => {
        const { result, down, up } = setup();
        down(0);
        up();
        down(3, { shiftKey: true });
        up();
        expect(result.current.editor.selected.sort()).toEqual([0, 3]);
    });

    it("gives the selected tiles a category with the number keys", () => {
        const { result, down, up, key } = setup();
        down(0);
        up();
        down(1, { shiftKey: true });
        up();
        key("2");
        expect(result.current.meta).toEqual({
            "0": { category: "WALL" },
            "1": { category: "WALL" },
        });
    });

    it("removes the category with delete and clears the selection with escape", () => {
        const { result, down, up, key } = setup({ "0": { category: "FLOOR" } });
        down(0);
        up();
        key("Delete");
        expect(result.current.meta).toEqual({});
        key("Escape");
        expect(result.current.editor.selected).toEqual([]);
    });

    it("paints the brush along a drag", () => {
        const { result, act, down, move, up, key } = setup();
        act(() => result.current.editor.setTool("paint"));
        key("3");
        down(0);
        move(1);
        move(2);
        up();
        expect(result.current.meta).toEqual({
            "0": { category: "CEILING" },
            "1": { category: "CEILING" },
            "2": { category: "CEILING" },
        });
        expect(result.current.editor.selected).toEqual([]);
    });

    it("picks the brush with the numpad and goes to painting", () => {
        const { result, down, up, key } = setup();
        key("4", "Numpad4");
        expect(result.current.editor.tool).toBe("paint");
        expect(result.current.editor.brush).toBe("DECORATION");

        key("5", "Numpad5");
        expect(result.current.editor.brush).toBe("EMPTY");
        down(1);
        up();
        expect(result.current.meta).toEqual({ "1": { category: "EMPTY" } });
    });

    it("keeps the tool that paints when the numpad changes the brush", () => {
        const { result, act, key } = setup();
        act(() => result.current.editor.setTool("rect"));
        key("2", "Numpad2");
        expect(result.current.editor.tool).toBe("rect");
        expect(result.current.editor.brush).toBe("WALL");
    });

    it("goes to the eraser with numpad 0 or E", () => {
        const { result, act, key } = setup();
        key("0", "Numpad0");
        expect(result.current.editor.tool).toBe("erase");

        act(() => result.current.editor.setTool("select"));
        key("e");
        expect(result.current.editor.tool).toBe("erase");
    });

    it("goes to the brush with P", () => {
        const { result, key } = setup();
        key("p");
        expect(result.current.editor.tool).toBe("paint");
    });

    it("erases along a drag with the eraser tool", () => {
        const { result, act, down, move, up } = setup({
            "0": { category: "FLOOR" },
            "1": { category: "FLOOR" },
        });
        act(() => result.current.editor.setTool("erase"));
        down(0);
        move(1);
        up();
        expect(result.current.meta).toEqual({});
    });

    it("finds the next tile with no category and moves the selection to it", () => {
        const { result, down, up, key } = setup({
            "0": { category: "FLOOR" },
            "1": { category: "FLOOR" },
        });
        down(0);
        up();
        key("n");
        expect(result.current.editor.selected).toEqual([2]);
    });

    it("sets the top of a wall with the top tool, and takes it away", () => {
        const { result, act, down, up } = setup({ "0": { category: "WALL" } });
        act(() => result.current.editor.setTool("top"));
        down(0);
        up();
        expect(result.current.editor.selected).toEqual([0]);
        down(5);
        up();
        expect(result.current.meta["0"]).toEqual({ category: "WALL", top: 5 });
        expect(result.current.editor.selected).toEqual([]);

        down(0);
        up();
        down(0);
        up();
        expect(result.current.meta["0"]).toEqual({ category: "WALL" });
    });

    it("moves the default of the blank map with the default tool", () => {
        const { result, act, down, up } = setup({
            "0": { category: "FLOOR", blankDefault: true },
            "1": { category: "FLOOR" },
        });
        act(() => result.current.editor.setTool("default"));
        down(1);
        up();
        expect(result.current.meta["0"]).toEqual({ category: "FLOOR" });
        expect(result.current.meta["1"]).toEqual({
            category: "FLOOR",
            blankDefault: true,
        });
        down(1);
        up();
        expect(result.current.meta["1"]).toEqual({ category: "FLOOR" });
    });

    it("paints solid tiles when the brush is solid, and the picker takes it", () => {
        const { result, act, down, up, key } = setup({
            "3": { category: "WALL", solid: true },
        });
        act(() => result.current.editor.setTool("paint"));
        key("q");
        down(0);
        up();
        expect(result.current.meta["0"]).toEqual({
            category: "FLOOR",
            solid: true,
        });
        key("q");
        down(0);
        up();
        expect(result.current.meta["0"]).toEqual({ category: "FLOOR" });

        act(() => result.current.editor.setTool("picker"));
        down(3);
        up();
        expect(result.current.editor.brush).toBe("WALL");
        expect(result.current.editor.brushSolid).toBe(true);
    });

    it("gives the selected tiles the solid with the toggle, when the tool does not paint", () => {
        const { result, act, down, up } = setup({ "0": { category: "FLOOR" } });
        down(0);
        up();
        act(() => result.current.editor.chooseSolid(true));
        expect(result.current.meta["0"]).toEqual({
            category: "FLOOR",
            solid: true,
        });
    });

    it("does not change a tile that maps already use", () => {
        const saved: TileMeta = { "0": { category: "FLOOR" } };
        const { result, down, up, key } = setup(saved, {
            savedMeta: saved,
            imageInUse: true,
        });
        down(0);
        up();
        down(1, { shiftKey: true });
        up();
        key("2");
        expect(result.current.meta).toEqual({
            "0": { category: "FLOOR" },
            "1": { category: "WALL" },
        });
        key("Delete");
        expect(result.current.meta["0"]).toEqual({ category: "FLOOR" });
    });
});

describe("useTileSheetEditor, history", () => {
    it("undoes and redoes a change with the keys", () => {
        const { result, down, up, key } = setup({ "0": { category: "FLOOR" } });
        down(0);
        up();
        key("Delete");
        expect(result.current.meta).toEqual({});

        key("z", "KeyZ", { ctrlKey: true });
        expect(result.current.meta).toEqual({ "0": { category: "FLOOR" } });
        key("z", "KeyZ", { ctrlKey: true, shiftKey: true });
        expect(result.current.meta).toEqual({});
    });

    it("takes a whole stroke as one step", () => {
        const { result, act, down, move, up, key } = setup();
        act(() => result.current.editor.setTool("paint"));
        down(0);
        move(1);
        move(2);
        up();
        expect(Object.keys(result.current.meta)).toHaveLength(3);

        key("z", "KeyZ", { ctrlKey: true });
        expect(result.current.meta).toEqual({});
        expect(result.current.editor.canUndo).toBe(false);
        expect(result.current.editor.canRedo).toBe(true);
    });

    it("forgets what can be redone once something new is done", () => {
        const { result, act, down, up, key } = setup({
            "0": { category: "FLOOR" },
        });
        down(0);
        up();
        key("Delete");
        key("y", "KeyY", { ctrlKey: true });
        key("z", "KeyZ", { ctrlKey: true });
        expect(result.current.editor.canRedo).toBe(true);

        act(() => result.current.editor.setTool("paint"));
        down(1);
        up();
        expect(result.current.editor.canRedo).toBe(false);
    });
});

describe("useTileSheetEditor, picking by category", () => {
    const sheet: TileMeta = {
        "0": { category: "FLOOR" },
        "1": { category: "FLOOR" },
        "3": { category: "FLOOR" },
        "5": { category: "WALL" },
    };

    it("selects the touching tiles with the wand", () => {
        const { result, act, down, up } = setup(sheet);
        act(() => result.current.editor.setTool("wand"));
        down(0);
        up();
        expect(result.current.editor.selected).toEqual([0, 1]);
    });

    it("selects every tile of the category with the same category tool", () => {
        const { result, act, down, up } = setup(sheet);
        act(() => result.current.editor.setTool("same"));
        down(0);
        up();
        expect(result.current.editor.selected).toEqual([0, 1, 3]);
    });

    it("joins the pick to the selection by the keys held", () => {
        const { result, act, down, up } = setup(sheet);
        act(() => result.current.editor.setTool("same"));
        down(5);
        up();
        down(0, { shiftKey: true });
        up();
        expect(result.current.editor.selected).toEqual([5, 0, 1, 3]);

        down(1, { ctrlKey: true });
        up();
        expect(result.current.editor.selected).toEqual([5]);
    });

    it("takes tiles away from a drag selection with ctrl", () => {
        const { result, down, move, up } = setup();
        down(0);
        move(3);
        up();
        expect(result.current.editor.selected).toEqual([0, 1, 2, 3]);

        down(1, { ctrlKey: true });
        move(2);
        up();
        expect(result.current.editor.selected).toEqual([0, 3]);
    });
});

describe("useTileSheetEditor, the bucket", () => {
    const sheet: TileMeta = {
        "0": { category: "FLOOR" },
        "1": { category: "FLOOR" },
        "3": { category: "FLOOR" },
    };

    it("fills only the touching tiles by default", () => {
        const { result, act, down, up } = setup(sheet);
        act(() => {
            result.current.editor.setTool("bucket");
            result.current.editor.setBrush("WALL");
        });
        down(0);
        up();
        expect(result.current.meta).toEqual({
            "0": { category: "WALL" },
            "1": { category: "WALL" },
            "3": { category: "FLOOR" },
        });
    });

    it("fills the whole sheet when it is not limited to the touching ones", () => {
        const { result, act, down, up } = setup(sheet);
        act(() => {
            result.current.editor.setTool("bucket");
            result.current.editor.setBrush("WALL");
            result.current.editor.setContiguous(false);
        });
        down(0);
        up();
        expect(result.current.meta["3"]).toEqual({ category: "WALL" });
    });

    it("shows what the bucket would fill under the pointer", () => {
        const { result, act, move } = setup(sheet);
        act(() => result.current.editor.setTool("bucket"));
        move(0);
        expect(result.current.editor.preview).toEqual([0, 1]);
        move(6);
        expect(result.current.editor.preview).toContain(6);
    });
});

describe("useTileSheetEditor, the keyboard and the brush line", () => {
    it("moves the selection with the arrows, and adds to it with shift", () => {
        const { result, key } = setup();
        key("ArrowRight", "ArrowRight");
        expect(result.current.editor.selected).toEqual([1]);
        key("ArrowDown", "ArrowDown");
        expect(result.current.editor.selected).toEqual([5]);
        key("ArrowRight", "ArrowRight", { shiftKey: true });
        expect(result.current.editor.selected).toEqual([5, 6]);
        key("ArrowUp", "ArrowUp");
        expect(result.current.editor.selected).toEqual([2]);
    });

    it("draws a straight line from the last painted tile with shift", () => {
        const { result, act, down, up } = setup();
        act(() => result.current.editor.setTool("paint"));
        down(0);
        up();
        down(3, { shiftKey: true });
        up();
        expect(Object.keys(result.current.meta)).toEqual(["0", "1", "2", "3"]);
    });
});
