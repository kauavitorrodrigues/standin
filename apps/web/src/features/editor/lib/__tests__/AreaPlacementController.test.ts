import { describe, expect, it, vi } from "vitest";
import {
    buildBlankEditorModel,
    type EditorModel,
    type LibraryPaletteArea,
    type Stamp,
} from "@standin/contracts";
import { AREA_PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { AreaPlacementController } from "@/features/editor/lib/AreaPlacementController";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import type { PlacingArea } from "@/features/editor/types/placing-area";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

const area: LibraryPaletteArea = {
    id: "area-1",
    name: "Sala",
    width: 2,
    height: 2,
    objectCount: 1,
    thumbnailUrl: "/files/thumb",
    version: 1,
};

// A 2 x 2 area with one crate and a named zone.
const stamp: Stamp = {
    version: 1,
    width: 2,
    height: 2,
    palette: [],
    layers: {},
    objects: [
        {
            assetId: "crate",
            dx: 0,
            dy: 1,
            offsetX: 0,
            offsetY: 0,
            parentIndex: null,
        },
    ],
    zone: { label: "Sala" },
};

const placingOf = (override: Partial<PlacingArea> = {}): PlacingArea => ({
    area,
    stamp,
    ...override,
});

const setup = (placingArea: PlacingArea | null = placingOf()) => {
    let state = { placingArea };
    const listeners = new Set<() => void>();
    const ghost = { show: vi.fn(), hide: vi.fn(), destroy: vi.fn() };
    const setHint = vi.fn();
    const cancelPlacingArea = vi.fn(() => {
        state = { placingArea: null };
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
            cancelPlacingArea,
        },
        setHint,
    } as unknown as ToolEnv;
    const controller = new AreaPlacementController(env, ghost);
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
        ctrl: false,
        model,
        dispatch,
        setHint,
        ...extra,
    });
    const pick = (next: PlacingArea | null) => {
        state = { placingArea: next };
        listeners.forEach((listener) => listener());
    };

    return {
        controller,
        ghost,
        setHint,
        dispatch,
        context,
        cancelPlacingArea,
        pick,
    };
};

describe("AreaPlacementController ghost", () => {
    it("shows a valid ghost with the cell as the top left corner", () => {
        const { controller, ghost, setHint, context } = setup();
        controller.onPointerMove(context([3, 4]));

        expect(ghost.show).toHaveBeenCalledWith({
            area,
            tileX: 3,
            tileY: 4,
            valid: true,
        });
        expect(setHint).toHaveBeenLastCalledWith(AREA_PLACEMENT_MESSAGES.READY);
    });

    it("turns the outline invalid and says why when it leaves the map", () => {
        const { controller, ghost, setHint, context } = setup();
        controller.onPointerMove(context([9, 9]));

        expect(ghost.show).toHaveBeenCalledWith(
            expect.objectContaining({ valid: false })
        );
        expect(setHint).toHaveBeenLastCalledWith(
            AREA_PLACEMENT_MESSAGES.OUT_OF_BOUNDS
        );
    });

    it("turns the outline invalid when an object is in the way", () => {
        const { controller, ghost, setHint, context } = setup();
        const model = buildModel([placedAt("c1", "crate", 4, 4)]);
        controller.onPointerMove(context([3, 3], model));

        expect(ghost.show).toHaveBeenCalledWith(
            expect.objectContaining({ valid: false })
        );
        expect(setHint).toHaveBeenLastCalledWith(
            AREA_PLACEMENT_MESSAGES.NOT_EMPTY
        );
    });

    it("says the limit was reached when the objects do not fit", () => {
        const { controller, setHint, context } = setup();
        controller.onPointerMove(context([3, 3], buildModel([], 0)));

        expect(setHint).toHaveBeenLastCalledWith(
            AREA_PLACEMENT_MESSAGES.LIMIT_REACHED
        );
    });

    it("does nothing while no area is being placed", () => {
        const { controller, ghost, context } = setup(null);
        controller.onPointerMove(context([3, 4]));

        expect(ghost.show).not.toHaveBeenCalled();
        expect(ghost.hide).toHaveBeenCalled();
    });

    it("hides when the pointer leaves, on Esc and on a new pick", () => {
        const { controller, ghost, setHint, cancelPlacingArea, pick } = setup();

        controller.onPointerLeave();
        expect(ghost.hide).toHaveBeenCalledTimes(1);
        expect(setHint).toHaveBeenLastCalledWith(null);

        pick(placingOf({ area: { ...area, id: "area-2" } }));
        expect(ghost.hide).toHaveBeenCalledTimes(2);

        controller.onCancel();
        expect(ghost.hide.mock.calls.length).toBeGreaterThan(2);
        expect(cancelPlacingArea).toHaveBeenCalledTimes(1);
    });

    it("destroys the ghost when the tool goes away", () => {
        const { controller, ghost } = setup();
        controller.onDeactivate();

        expect(ghost.destroy).toHaveBeenCalledTimes(1);
    });
});

describe("AreaPlacementController click", () => {
    it("sends every operation of the stamp as ONE gesture and stays on", () => {
        const { controller, ghost, dispatch, cancelPlacingArea, context } =
            setup();
        controller.onPointerUp(context([3, 4]));

        expect(dispatch).toHaveBeenCalledTimes(1);
        const [ops] = dispatch.mock.calls[0] as unknown as [{ type: string }[]];
        expect(ops.map((op) => op.type)).toEqual(["place_asset", "set_zone"]);
        expect(ghost.hide).toHaveBeenCalled();
        expect(cancelPlacingArea).not.toHaveBeenCalled();
    });

    it("sends nothing on a refused spot and shows the reason", () => {
        const { controller, dispatch, setHint, context } = setup();
        controller.onPointerUp(context([9, 9]));

        expect(dispatch).not.toHaveBeenCalled();
        expect(setHint).toHaveBeenLastCalledWith(
            AREA_PLACEMENT_MESSAGES.OUT_OF_BOUNDS
        );
    });

    it("applies nothing when the stamp ops fail to build", () => {
        // The cheap check passes, but a monitor with no desk under it is
        // refused when the operations are replayed.
        const broken = placingOf({
            stamp: {
                ...stamp,
                objects: [{ ...stamp.objects[0]!, assetId: "monitor" }],
            },
        });
        const { controller, dispatch, setHint, context } = setup(broken);
        controller.onPointerUp(context([3, 4]));

        expect(dispatch).not.toHaveBeenCalled();
        expect(setHint).toHaveBeenLastCalledWith(
            AREA_PLACEMENT_MESSAGES.PLACE_FAILED
        );
    });

    it("shows the reason when the draft refuses the gesture", () => {
        const { controller, dispatch, setHint, context } = setup();
        dispatch.mockReturnValueOnce({ ok: false, errors: [] } as never);
        controller.onPointerUp(context([3, 4]));

        expect(setHint).toHaveBeenLastCalledWith(
            AREA_PLACEMENT_MESSAGES.PLACE_FAILED
        );
    });

    it("ignores the other buttons", () => {
        const { controller, dispatch, context } = setup();
        controller.onPointerUp(context([3, 4], buildModel(), { button: 2 }));

        expect(dispatch).not.toHaveBeenCalled();
    });
});

describe("area placement and undo", () => {
    it("is a single undo step that restores the map and redoes it", () => {
        const library = buildModel().library;
        const base = buildBlankEditorModel({ width: 10, height: 10, library });
        const draft = createDraftStore(base);
        // The map keeps its spawn, so removing the zone of the area is legal.
        draft.dispatchGesture([
            {
                type: "set_zone",
                zone: { kind: "spawn", rect: { x: 8, y: 8, w: 1, h: 1 } },
            },
        ]);
        const { controller, context } = setup();

        controller.onPointerUp(
            context([2, 2], draft.getState().draft, {
                dispatch: draft.dispatchGesture,
            })
        );
        expect(draft.getState().draft.placed).toHaveLength(1);
        expect(getLayoutZones(draft.getState().draft.layout)).toHaveLength(2);
        expect(draft.getState().undo).toHaveLength(2);

        draft.undo();
        expect(draft.getState().draft.placed).toHaveLength(0);
        expect(getLayoutZones(draft.getState().draft.layout)).toHaveLength(1);

        draft.redo();
        expect(draft.getState().draft.placed).toHaveLength(1);
        expect(getLayoutZones(draft.getState().draft.layout)).toHaveLength(2);
    });
});
