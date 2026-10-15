import { describe, expect, it, vi } from "vitest";
import type { EditorModel } from "@standin/contracts";
import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { PlacementController } from "@/features/editor/lib/PlacementController";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

const setup = (placing: string | null = "crate") => {
    let state = { placing };
    const listeners = new Set<() => void>();
    const ghost = { show: vi.fn(), hide: vi.fn(), destroy: vi.fn() };
    const setHint = vi.fn();
    const cancelPlacing = vi.fn(() => {
        state = { placing: null };
        listeners.forEach((listener) => listener());
    });
    const env = {
        scene: {},
        store: {
            getState: () => state,
            subscribe: (listener: () => void) => {
                listeners.add(listener);
                return () => listeners.delete(listener);
            },
            cancelPlacing,
        },
        setHint,
    } as unknown as ToolEnv;
    const controller = new PlacementController(env, ghost);
    controller.onActivate();

    const dispatch = vi.fn(() => ({ ok: true }) as const);
    const context = (
        cell: [number, number],
        model: EditorModel = buildModel(),
        extra: Partial<ToolContext> = {}
    ): ToolContext => ({
        cell,
        button: 0,
        alt: false,
        worldX: 0,
        worldY: 0,
        shift: false,
        // Ctrl snaps to the grid, which is what these tests check.
        ctrl: true,
        model,
        dispatch,
        setHint,
        ...extra,
    });
    const pick = (next: string | null) => {
        state = { placing: next };
        listeners.forEach((listener) => listener());
    };

    return {
        controller,
        ghost,
        setHint,
        dispatch,
        context,
        cancelPlacing,
        pick,
    };
};

describe("PlacementController ghost", () => {
    it("shows a valid ghost at the layout of a placed object", () => {
        const { controller, ghost, setHint, context } = setup();
        controller.onPointerMove(context([3, 4]));

        expect(ghost.show).toHaveBeenCalledWith(
            expect.objectContaining({ valid: true, x: 96, bottomY: 160 })
        );
        expect(setHint).toHaveBeenLastCalledWith(PLACEMENT_MESSAGES.READY);
    });

    it("shows an invalid ghost with the reason when the spot is taken", () => {
        const { controller, ghost, setHint, context } = setup();
        const model = buildModel([placedAt("c1", "crate", 3, 4)]);
        controller.onPointerMove(context([3, 4], model));

        expect(ghost.show).toHaveBeenCalledWith(
            expect.objectContaining({ valid: false })
        );
        expect(setHint).toHaveBeenLastCalledWith(PLACEMENT_MESSAGES.OVERLAP);
    });

    it("sits a SURFACE item on the top of the desk", () => {
        const { controller, ghost, context } = setup("monitor");
        const model = buildModel([placedAt("desk-1", "desk", 2, 4)]);
        controller.onPointerMove(context([3, 4], model));

        expect(ghost.show).toHaveBeenCalledWith(
            expect.objectContaining({ valid: true, x: 96, bottomY: 160 - 16 })
        );
    });

    it("does nothing while no asset is being placed", () => {
        const { controller, ghost, context } = setup(null);
        controller.onPointerMove(context([3, 4]));

        expect(ghost.show).not.toHaveBeenCalled();
        expect(ghost.hide).toHaveBeenCalled();
    });

    it("hides when the pointer leaves, on Esc, and on a new pick", () => {
        const { controller, ghost, setHint, cancelPlacing, pick } = setup();

        controller.onPointerLeave();
        expect(ghost.hide).toHaveBeenCalledTimes(1);
        expect(setHint).toHaveBeenLastCalledWith(null);

        pick("desk");
        expect(ghost.hide).toHaveBeenCalledTimes(2);

        controller.onCancel();
        expect(ghost.hide).toHaveBeenCalled();
        expect(cancelPlacing).toHaveBeenCalledTimes(1);
    });

    it("destroys the ghost when the tool is deactivated", () => {
        const { controller, ghost, pick } = setup();
        controller.onDeactivate();
        expect(ghost.destroy).toHaveBeenCalledTimes(1);

        pick("desk");
        expect(ghost.hide).not.toHaveBeenCalled();
    });
});

describe("PlacementController click", () => {
    it("emits ONE gesture with the exact place_asset", () => {
        const { controller, dispatch, context } = setup();
        controller.onPointerUp(context([3, 4]));

        expect(dispatch).toHaveBeenCalledTimes(1);
        const [ops] = dispatch.mock.calls[0] as unknown as [unknown[]];
        expect(ops).toHaveLength(1);
        expect(ops[0]).toEqual({
            type: "place_asset",
            tempId: expect.stringMatching(/^tmp_[0-9a-f-]{36}$/),
            assetId: "crate",
            tileX: 3,
            tileY: 4,
            offsetX: 0,
            offsetY: 0,
        });
    });

    it("places free by default with the middle of the footprint under the pointer", () => {
        const { controller, dispatch, context } = setup();
        controller.onPointerUp(
            context([3, 4], buildModel(), {
                ctrl: false,
                worldX: 3 * 32 + 30,
                worldY: 4 * 32 + 10,
            })
        );

        const [ops] = dispatch.mock.calls[0] as unknown as [unknown[]];
        expect(ops[0]).toMatchObject({
            tileX: 3,
            tileY: 3,
            offsetX: 14,
            offsetY: 26,
        });
    });

    it("keeps shift free too", () => {
        const { controller, dispatch, context } = setup();
        controller.onPointerUp(
            context([3, 4], buildModel(), {
                ctrl: false,
                shift: true,
                worldX: 3 * 32 + 16,
                worldY: 4 * 32 + 16,
            })
        );

        const [ops] = dispatch.mock.calls[0] as unknown as [unknown[]];
        expect(ops[0]).toMatchObject({ offsetX: 0, offsetY: 0 });
    });

    it("sends a different tempId on each click and stays in the mode", () => {
        const { controller, dispatch, context, cancelPlacing } = setup();
        controller.onPointerUp(context([1, 1]));
        controller.onPointerUp(context([2, 2]));

        const sent = dispatch.mock.calls as unknown as [{ tempId: string }[]][];
        const ids = sent.map(([ops]) => ops[0].tempId);
        expect(new Set(ids).size).toBe(2);
        expect(cancelPlacing).not.toHaveBeenCalled();
    });

    it("sends the desk as parentId for a SURFACE item", () => {
        const { controller, dispatch, context } = setup("monitor");
        const model = buildModel([placedAt("desk-1", "desk", 2, 4)]);
        controller.onPointerUp(context([3, 4], model));

        const [ops] = dispatch.mock.calls[0] as unknown as [unknown[]];
        expect(ops[0]).toMatchObject({
            assetId: "monitor",
            tileX: 3,
            tileY: 4,
            parentId: "desk-1",
        });
    });

    it("does not emit on an invalid spot and says why", () => {
        const { controller, dispatch, setHint, context } = setup();
        const model = buildModel([placedAt("c1", "crate", 3, 4)]);
        controller.onPointerUp(context([3, 4], model));

        expect(dispatch).not.toHaveBeenCalled();
        expect(setHint).toHaveBeenLastCalledWith(PLACEMENT_MESSAGES.OVERLAP);
    });

    it("does not place when the meter is full", () => {
        const { controller, dispatch, setHint, context } = setup();
        const model = buildModel([placedAt("c1", "crate", 0, 0)], 1);
        controller.onPointerUp(context([5, 5], model));

        expect(dispatch).not.toHaveBeenCalled();
        expect(setHint).toHaveBeenLastCalledWith(
            PLACEMENT_MESSAGES.LIMIT_REACHED
        );
    });

    it("turns a refused dispatch into a hint", () => {
        const { controller, setHint, context } = setup();
        const failing = vi.fn(() => ({
            ok: false as const,
            errors: [
                {
                    code: "FOOTPRINT_OVERLAP" as const,
                    path: "ops[0]",
                    message: "x",
                },
            ],
        }));
        controller.onPointerUp(
            context([3, 4], buildModel(), { dispatch: failing })
        );

        expect(failing).toHaveBeenCalledTimes(1);
        expect(setHint).toHaveBeenLastCalledWith(PLACEMENT_MESSAGES.OVERLAP);
    });

    it("ignores other buttons and a click with nothing to place", () => {
        const first = setup();
        first.controller.onPointerUp(
            first.context([3, 4], buildModel(), { button: 2 })
        );
        expect(first.dispatch).not.toHaveBeenCalled();

        const second = setup(null);
        second.controller.onPointerUp(second.context([3, 4]));
        expect(second.dispatch).not.toHaveBeenCalled();
    });
});
