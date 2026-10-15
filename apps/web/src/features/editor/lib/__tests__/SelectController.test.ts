import { describe, expect, it, vi } from "vitest";
import type { Cell, EditorModel } from "@standin/contracts";
import { SELECTION_MESSAGES } from "@/features/editor/consts/messages";
import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { SelectController } from "@/features/editor/lib/SelectController";
import type { SelectionProvider } from "@/features/editor/types/SelectionProvider";
import type { SelectionTarget } from "@/features/editor/types/SelectionTarget";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

// A provider that answers a fixed target per pointer position (in px).
const providerOf = (
    answer: (x: number, y: number) => SelectionTarget | null
): SelectionProvider => ({
    hitTest: ({ worldX, worldY }) => answer(worldX, worldY),
});

const setup = (model: EditorModel, provider: SelectionProvider) => {
    const draft = createDraftStore(model);
    const dispatch = vi.spyOn(draft, "dispatchGesture");
    const hints: (string | null)[] = [];
    const setHint = (text: string | null) => hints.push(text);
    let selection: string[] = [];
    const store = {
        getState: () => ({ selection }),
        setSelection: vi.fn((ids: string[]) => {
            selection = ids;
        }),
        clearSelection: vi.fn(),
    };
    const env = { scene: {}, store, setHint } as unknown as ToolEnv;
    const ghost = { show: vi.fn(), hide: vi.fn(), destroy: vi.fn() };
    const hover = { show: vi.fn(), hide: vi.fn(), destroy: vi.fn() };
    const controller = new SelectController(
        env,
        [provider],
        ghost,
        null,
        hover
    );

    // The grid is what most tests check, so Ctrl is on unless a test says no.
    const at = (cell: Cell, button = 0, ctrl = true): ToolContext => ({
        cell,
        worldX: cell[0] * 32 + 1,
        worldY: cell[1] * 32 + 1,
        button,
        alt: false,
        shift: false,
        ctrl,
        model: draft.getState().draft,
        dispatch: draft.dispatchGesture,
        setHint,
    });

    return { controller, ghost, hover, store, dispatch, draft, hints, at };
};

const crateAtCell = (id: string, cell: Cell) =>
    providerOf((x, y) =>
        Math.floor(x / 32) === cell[0] && Math.floor(y / 32) === cell[1]
            ? { kind: "object", id, depth: 1, area: 1024 }
            : null
    );

describe("SelectController selection", () => {
    it("selects the object under the pointer", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, store, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4]));

        expect(store.setSelection).toHaveBeenCalledWith(["c"]);
    });

    it("clears the selection when the click hits nothing", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, store, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([7, 7]));

        expect(store.clearSelection).toHaveBeenCalledTimes(1);
        expect(store.setSelection).not.toHaveBeenCalled();
    });

    it("ignores a button other than the primary one", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, store, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4], 2));

        expect(store.setSelection).not.toHaveBeenCalled();
        expect(store.clearSelection).not.toHaveBeenCalled();
    });

    it("lets the winner of several providers be the deeper one", () => {
        const model = buildModel([
            placedAt("low", "crate", 2, 4),
            placedAt("high", "crate", 2, 4),
        ]);
        const { store, at, ghost } = setup(model, crateAtCell("low", [2, 4]));
        const controller = new SelectController(
            { scene: {}, store, setHint: vi.fn() } as unknown as ToolEnv,
            [
                providerOf(() => ({
                    kind: "object",
                    id: "low",
                    depth: 1,
                    area: 1,
                })),
                providerOf(() => ({
                    kind: "zone",
                    id: "zone",
                    depth: 9,
                    area: 1,
                })),
            ],
            ghost
        );

        controller.onPointerDown(at([2, 4]));

        expect(store.setSelection).toHaveBeenCalledWith(["zone"]);
    });
});

describe("SelectController drag", () => {
    it("shows a valid ghost and sends ONE move_asset on release", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, ghost, dispatch, draft, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4]));
        controller.onPointerMove(at([3, 4]));
        controller.onPointerMove(at([5, 6]));

        expect(ghost.show).toHaveBeenLastCalledWith(
            expect.objectContaining({ valid: true, x: 160, bottomY: 224 })
        );

        controller.onPointerUp(at([5, 6]));

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith([
            {
                type: "move_asset",
                id: "c",
                tileX: 5,
                tileY: 6,
                offsetX: 0,
                offsetY: 0,
            },
        ]);
        expect(draft.getState().draft.placed[0]).toMatchObject({
            tileX: 5,
            tileY: 6,
        });
        expect(draft.getState().undo).toHaveLength(1);
    });

    it("drags free without Ctrl and keeps the grabbed point under the pointer", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, dispatch, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );
        const press = at([2, 4], 0, false);
        const release = {
            ...at([3, 4], 0, false),
            worldX: press.worldX + 40,
            worldY: press.worldY + 7,
        };

        controller.onPointerDown(press);
        controller.onPointerMove(release);
        controller.onPointerUp(release);

        expect(dispatch).toHaveBeenCalledWith([
            {
                type: "move_asset",
                id: "c",
                tileX: 3,
                tileY: 4,
                offsetX: 8,
                offsetY: 7,
            },
        ]);
    });

    it("treats a free drag of a few px as a click", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, dispatch, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );
        const press = at([2, 4], 0, false);

        controller.onPointerDown(press);
        controller.onPointerUp({ ...press, worldX: press.worldX + 2 });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("shows a red ghost and sends nothing on an invalid spot", () => {
        const model = buildModel([
            placedAt("c", "crate", 2, 4),
            placedAt("d", "crate", 5, 6),
        ]);
        const { controller, ghost, dispatch, hints, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4]));
        controller.onPointerMove(at([5, 6]));
        expect(ghost.show).toHaveBeenLastCalledWith(
            expect.objectContaining({ valid: false })
        );
        expect(hints.at(-1)).toBe(PLACEMENT_MESSAGES.OVERLAP);

        controller.onPointerUp(at([5, 6]));

        expect(dispatch).not.toHaveBeenCalled();
        expect(hints.at(-1)).toBe(PLACEMENT_MESSAGES.OVERLAP);
    });

    it("treats a release on the same cell as a click", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, dispatch, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4]));
        controller.onPointerUp(at([2, 4]));

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("clears the selection on a click over an object already selected", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, store, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4]));
        controller.onPointerUp(at([2, 4]));
        expect(store.clearSelection).not.toHaveBeenCalled();

        controller.onPointerDown(at([2, 4]));
        controller.onPointerUp(at([2, 4]));
        expect(store.clearSelection).toHaveBeenCalledTimes(1);
    });

    it("drops the drag on cancel", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, ghost, dispatch, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4]));
        controller.onPointerMove(at([5, 6]));
        controller.onCancel();
        controller.onPointerUp(at([5, 6]));

        expect(ghost.hide).toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("says so when the draft refuses the gesture", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, hints, at, draft } = setup(
            model,
            crateAtCell("c", [2, 4])
        );
        controller.onPointerDown(at([2, 4]));
        vi.spyOn(draft, "dispatchGesture");
        const context = at([3, 4]);
        context.dispatch = () => ({ ok: false, errors: [] });

        controller.onPointerUp(context);

        expect(hints.at(-1)).toBe(SELECTION_MESSAGES.MOVE_FAILED);
    });
});

describe("SelectController hover", () => {
    it("outlines the object under the pointer", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, hover, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerMove(at([2, 4]));

        expect(hover.show).toHaveBeenCalledWith(expect.anything(), "c");
    });

    it("clears the mark when the pointer is over nothing", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, hover, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerMove(at([7, 7]));

        expect(hover.show).not.toHaveBeenCalled();
        expect(hover.hide).toHaveBeenCalled();
    });

    it("does not mark a zone", () => {
        const model = buildModel([]);
        const { controller, hover, at } = setup(
            model,
            providerOf(() => ({
                kind: "zone",
                id: "zone:area:1",
                depth: 0,
                area: 1,
            }))
        );

        controller.onPointerMove(at([1, 1]));

        expect(hover.show).not.toHaveBeenCalled();
    });

    it("hides the mark when the pointer leaves the map", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, hover } = setup(model, crateAtCell("c", [2, 4]));

        controller.onPointerLeave();

        expect(hover.hide).toHaveBeenCalled();
    });

    it("does not mark an object that is already selected", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const { controller, hover, at } = setup(
            model,
            crateAtCell("c", [2, 4])
        );

        controller.onPointerDown(at([2, 4]));
        controller.onPointerUp(at([2, 4]));
        controller.onPointerMove(at([2, 4]));

        expect(hover.show).not.toHaveBeenCalled();
        expect(hover.hide).toHaveBeenCalled();
    });
});
