import { describe, expect, it, vi } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { EditorToolRouter } from "@/features/editor/lib/EditorToolRouter";
import type { EditorTool } from "@/features/editor/types/tool";
import type { PublishPhase } from "@/features/editor/types/publish-phase";
import type { ToolController } from "@/features/editor/types/ToolController";
import type {
    ToolInputHandlers,
    ToolPointerInput,
} from "@/features/editor/types/ToolInput";

type FakeState = {
    tool: EditorTool;
    publishPhase: PublishPhase;
    locked: boolean;
};

const at = (
    cellX: number,
    cellY: number,
    extra: Partial<ToolPointerInput> = {}
): ToolPointerInput => ({
    worldX: cellX * TILE_SIZE + 1,
    worldY: cellY * TILE_SIZE + 1,
    button: 0,
    leftDown: true,
    alt: false,
    shift: false,
    ctrl: false,
    ...extra,
});

const createController = () =>
    ({
        onActivate: vi.fn(),
        onDeactivate: vi.fn(),
        onPointerDown: vi.fn(),
        onPointerMove: vi.fn(),
        onPointerUp: vi.fn(),
        onPointerLeave: vi.fn(),
        onCancel: vi.fn(),
    }) satisfies ToolController;

const setup = (initial: Partial<FakeState> = {}) => {
    let state: FakeState = {
        tool: EDITOR_TOOLS.PAINT,
        publishPhase: PUBLISH_PHASE.IDLE,
        locked: false,
        ...initial,
    };
    const listeners = new Set<() => void>();
    let handlers!: ToolInputHandlers;
    let spaceHeld = false;
    const unbind = vi.fn();
    const onHint = vi.fn();
    const paint = createController();
    const erase = createController();
    const dispatch = vi.fn(() => ({ ok: true as const }));
    const model = { marker: "draft" };
    let capturedSetHint: ((text: string | null) => void) | undefined;

    const router = new EditorToolRouter({
        registry: {
            [EDITOR_TOOLS.PAINT]: (env) => {
                capturedSetHint = env.setHint;
                return paint;
            },
            [EDITOR_TOOLS.ERASE]: () => erase,
        },
        source: (next) => {
            handlers = next;
            return unbind;
        },
        store: {
            getState: () => state,
            subscribe: (listener) => {
                listeners.add(listener);
                return () => listeners.delete(listener);
            },
        },
        env: { scene: {} as never, store: {} as never },
        columns: 10,
        rows: 10,
        isSpaceHeld: () => spaceHeld,
        getModel: () => model as never,
        dispatch,
        onHint,
    });

    return {
        router,
        paint,
        erase,
        dispatch,
        onHint,
        unbind,
        model,
        send: () => handlers,
        setSpace: (value: boolean) => {
            spaceHeld = value;
        },
        patch: (next: Partial<FakeState>) => {
            state = { ...state, ...next };
            listeners.forEach((listener) => listener());
        },
        setHint: (text: string | null) => capturedSetHint?.(text),
    };
};

describe("EditorToolRouter", () => {
    it("activates the controller of the active tool", () => {
        const { paint, erase } = setup();
        expect(paint.onActivate).toHaveBeenCalledTimes(1);
        expect(erase.onActivate).not.toHaveBeenCalled();
    });

    it("hands the cell, the modifiers, the model and dispatch to the controller", () => {
        const { send, paint, dispatch, model } = setup();

        send().down(at(2, 3, { alt: true, ctrl: true }));

        const context = paint.onPointerDown.mock.calls[0][0];
        expect(context.cell).toEqual([2, 3]);
        expect(context.alt).toBe(true);
        expect(context.ctrl).toBe(true);
        expect(context.shift).toBe(false);
        expect(context.model).toBe(model);
        context.dispatch([]);
        expect(dispatch).toHaveBeenCalledWith([]);
    });

    it("routes move and up to the active tool", () => {
        const { send, paint } = setup();

        send().down(at(1, 1));
        send().move(at(2, 1));
        send().up(at(3, 1));

        expect(paint.onPointerMove.mock.calls[0][0].cell).toEqual([2, 1]);
        expect(paint.onPointerUp.mock.calls[0][0].cell).toEqual([3, 1]);
    });

    it("swaps controllers when the tool changes", () => {
        const { patch, paint, erase, send } = setup();

        patch({ tool: EDITOR_TOOLS.ERASE });

        expect(paint.onDeactivate).toHaveBeenCalledTimes(1);
        expect(erase.onActivate).toHaveBeenCalledTimes(1);
        send().down(at(1, 1));
        expect(paint.onPointerDown).not.toHaveBeenCalled();
        expect(erase.onPointerDown).toHaveBeenCalledTimes(1);
    });

    it("does nothing for a tool with no controller", () => {
        const { patch, send, paint } = setup();

        patch({ tool: EDITOR_TOOLS.SELECT });

        expect(() => send().down(at(1, 1))).not.toThrow();
        expect(paint.onPointerDown).not.toHaveBeenCalled();
    });

    it("ignores a pan with the middle button", () => {
        const { send, paint } = setup();

        send().down(at(1, 1, { button: 1, leftDown: false }));
        send().move(at(2, 1));
        send().up(at(2, 1));

        expect(paint.onPointerDown).not.toHaveBeenCalled();
        expect(paint.onPointerMove).not.toHaveBeenCalled();
        expect(paint.onPointerUp).not.toHaveBeenCalled();
    });

    it("ignores a pan with space held, and draws again after it", () => {
        const { send, paint, setSpace } = setup();

        setSpace(true);
        send().down(at(1, 1));
        send().move(at(2, 1));
        send().up(at(2, 1));
        setSpace(false);
        send().down(at(1, 1));

        expect(paint.onPointerMove).not.toHaveBeenCalled();
        expect(paint.onPointerDown).toHaveBeenCalledTimes(1);
    });

    it("ignores the pointer with the pan tool", () => {
        const { send, patch, paint } = setup();
        patch({ tool: EDITOR_TOOLS.PAN });

        send().down(at(1, 1));
        send().move(at(2, 1));

        expect(paint.onPointerDown).not.toHaveBeenCalled();
        expect(paint.onPointerMove).not.toHaveBeenCalled();
    });

    it("does not act once the lock is lost", () => {
        const { send, patch, paint } = setup();
        patch({ locked: true });

        send().down(at(1, 1));
        send().move(at(2, 1));

        expect(paint.onPointerDown).not.toHaveBeenCalled();
        expect(paint.onPointerMove).not.toHaveBeenCalled();
    });

    it("does not act while a publish runs", () => {
        const { send, patch, paint } = setup();
        patch({ publishPhase: PUBLISH_PHASE.PUBLISHING });

        send().down(at(1, 1));

        expect(paint.onPointerDown).not.toHaveBeenCalled();
    });

    it("cancels a running gesture when the lock is lost", () => {
        const { send, patch, paint } = setup();

        send().down(at(1, 1));
        patch({ locked: true });
        send().up(at(2, 1));

        expect(paint.onCancel).toHaveBeenCalledTimes(1);
        expect(paint.onPointerUp).not.toHaveBeenCalled();
    });

    it("does not act on a cell outside the map", () => {
        const { send, paint } = setup();

        send().down(at(10, 1));
        send().down(at(-1, 1));
        send().move(at(1, 10));

        expect(paint.onPointerDown).not.toHaveBeenCalled();
        expect(paint.onPointerMove).not.toHaveBeenCalled();
    });

    it("tells the controller when the pointer leaves the map", () => {
        const { send, paint } = setup();

        send().move(at(1, 1));
        send().move(at(11, 1));
        send().move(at(12, 1));

        expect(paint.onPointerLeave).toHaveBeenCalledTimes(1);
    });

    it("ends a gesture released outside the map on the last cell inside", () => {
        const { send, paint } = setup();

        send().down(at(1, 1));
        send().move(at(4, 1));
        send().up(at(20, 1));

        expect(paint.onPointerUp.mock.calls[0][0].cell).toEqual([4, 1]);
    });

    it("calls onCancel on Esc, even when editing is off", () => {
        const { send, patch, paint } = setup();
        patch({ locked: true });
        paint.onCancel.mockClear();

        send().cancel();

        expect(paint.onCancel).toHaveBeenCalledTimes(1);
    });

    it("passes the hint to the sink, once per change", () => {
        const { setHint, onHint } = setup();

        setHint("sem espaço");
        setHint("sem espaço");
        setHint(null);

        expect(onHint.mock.calls).toEqual([["sem espaço"], [null]]);
    });

    it("clears the hint when the tool changes", () => {
        const { setHint, patch, onHint } = setup();
        setHint("dica");

        patch({ tool: EDITOR_TOOLS.ERASE });

        expect(onHint).toHaveBeenLastCalledWith(null);
    });

    it("unsubscribes and deactivates on destroy", () => {
        const { router, unbind, paint } = setup();

        router.destroy();

        expect(unbind).toHaveBeenCalledTimes(1);
        expect(paint.onDeactivate).toHaveBeenCalledTimes(1);
    });
});
