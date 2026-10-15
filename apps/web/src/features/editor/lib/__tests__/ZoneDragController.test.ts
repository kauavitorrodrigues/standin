import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AssetDefinition, Cell, EditorModel } from "@standin/contracts";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import { ZoneDragController } from "@/features/editor/lib/ZoneDragController";
import { buildZoneModel } from "@/features/editor/lib/__tests__/fixtures/buildZoneModel";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { toZoneSelectionId } from "@/features/editor/utils/toZoneSelectionId";
import { DEFAULT_EDITOR_VIEW_PREFERENCES } from "@/features/editor/consts/editorViewPreferences";
import { editorViewPreference } from "@/features/editor/lib/editorViewPreferences";
// The view choices are remembered across editors, so each case starts from the defaults.
beforeEach(() => {
    editorViewPreference.set(DEFAULT_EDITOR_VIEW_PREFERENCES);
});

const setup = (model: EditorModel) => {
    const draft = createDraftStore(model);
    const store = createEditorStore();
    store.attachSelectionHost({
        getModel: () => draft.getState().draft,
        dispatch: draft.dispatchGesture,
    });
    const hints: (string | null)[] = [];
    const setHint = (text: string | null) => hints.push(text);
    const preview = {
        showArea: vi.fn(),
        showSpawn: vi.fn(),
        hide: vi.fn(),
        destroy: vi.fn(),
    };
    const env = { scene: {}, store, setHint } as unknown as ToolEnv;
    const controller = new ZoneDragController(env, preview as never);
    const dispatch = vi.spyOn(draft, "dispatchGesture");

    const at = (cell: Cell, offset = 1): ToolContext => ({
        cell,
        worldX: cell[0] * 32 + offset,
        worldY: cell[1] * 32 + offset,
        button: 0,
        alt: false,
        shift: false,
        ctrl: false,
        model: draft.getState().draft,
        dispatch: draft.dispatchGesture,
        setHint,
    });
    const zone = (id: number) =>
        getLayoutZones(draft.getState().draft.layout).find((z) => z.id === id);

    return { draft, store, controller, preview, dispatch, hints, at, zone };
};

const model = () =>
    buildZoneModel([
        { id: 1, kind: "spawn", x: 0, y: 0, w: 1, h: 1 },
        { id: 2, kind: "area", x: 3, y: 3, w: 4, h: 4, label: "Sala" },
    ]);

describe("ZoneDragController move", () => {
    it("moves a zone by its body with ONE set_zone carrying its id", () => {
        const { controller, dispatch, at, zone, draft } = setup(model());

        controller.pressBody(at([4, 4]), toZoneSelectionId(2));
        controller.onPointerMove(at([5, 4]));
        controller.onPointerUp(at([5, 4]));

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toEqual([
            {
                type: "set_zone",
                zone: {
                    id: 2,
                    kind: "area",
                    rect: { x: 4, y: 3, w: 4, h: 4 },
                    label: "Sala",
                },
            },
        ]);
        expect(zone(2)?.x).toBe(4 * 32);
        draft.undo();
        expect(zone(2)?.x).toBe(3 * 32);
    });

    it("moves a spawn without a name and shows a preview while dragging", () => {
        const { controller, dispatch, preview, at, zone } = setup(model());

        controller.pressBody(at([0, 0]), toZoneSelectionId(1));
        controller.onPointerMove(at([2, 1]));
        expect(preview.showSpawn).toHaveBeenCalledWith([2, 1]);
        controller.onPointerUp(at([2, 1]));

        expect(dispatch.mock.calls[0][0]).toEqual([
            {
                type: "set_zone",
                zone: {
                    id: 1,
                    kind: "spawn",
                    rect: { x: 2, y: 1, w: 1, h: 1 },
                },
            },
        ]);
        expect(zone(1)?.x).toBe(64);
    });

    it("emits nothing when released where it started", () => {
        const { controller, dispatch, at } = setup(model());

        controller.pressBody(at([4, 4]), toZoneSelectionId(2));
        controller.onPointerUp(at([4, 4]));

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("keeps the zone inside the map", () => {
        const { controller, at, zone } = setup(model());

        controller.pressBody(at([4, 4]), toZoneSelectionId(2));
        controller.onPointerUp(at([9, 9]));

        expect(zone(2)?.x).toBe(6 * 32);
        expect(zone(2)?.y).toBe(6 * 32);
    });
});

describe("ZoneDragController resize", () => {
    it("resizes the selected area by a handle with ONE set_zone", () => {
        const { controller, store, dispatch, at, zone } = setup(model());
        store.setSelection([toZoneSelectionId(2)]);

        // The south east corner of the area is at (7, 7) tiles.
        const pressed = controller.pressHandle({
            ...at([6, 6]),
            worldX: 7 * 32,
            worldY: 7 * 32,
        });
        controller.onPointerUp(at([8, 8]));

        expect(pressed).toBe(true);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(zone(2)?.width).toBe(6 * 32);
        expect(zone(2)?.height).toBe(6 * 32);
    });

    it("does not resize below the minimum", () => {
        const { controller, store, at, zone } = setup(model());
        store.setSelection([toZoneSelectionId(2)]);

        controller.pressHandle({
            ...at([6, 6]),
            worldX: 7 * 32,
            worldY: 7 * 32,
        });
        controller.onPointerUp(at([3, 3]));

        expect(zone(2)?.width).toBe(2 * 32);
        expect(zone(2)?.height).toBe(2 * 32);
    });

    it("gives a spawn no handles", () => {
        const { controller, store, at } = setup(model());
        store.setSelection([toZoneSelectionId(1)]);

        expect(
            controller.pressHandle({ ...at([0, 0]), worldX: 0, worldY: 0 })
        ).toBe(false);
    });

    it("ignores handles while the zones are hidden", () => {
        const { controller, store, at } = setup(model());
        store.setSelection([toZoneSelectionId(2)]);
        store.toggleZones();

        expect(
            controller.pressHandle({
                ...at([6, 6]),
                worldX: 7 * 32,
                worldY: 7 * 32,
            })
        ).toBe(false);
    });
});

const doorAsset = {
    id: "door",
    type: "DOOR",
    placement: "GROUND",
    footprint: { w: 1, h: 1, offsetX: 0 },
    surfaceHeightPx: 0,
} as unknown as AssetDefinition;

// A room at (3, 3) 4 x 4 with a door on its top border, at tile (4, 2).
const roomWithDoor = (): EditorModel => {
    const base = buildZoneModel([
        { id: 1, kind: "spawn", x: 0, y: 0, w: 1, h: 1 },
        {
            id: 2,
            kind: "private",
            x: 3,
            y: 3,
            w: 4,
            h: 4,
            label: "Sala",
            key: "room-a",
        },
    ]);
    return {
        ...base,
        placed: [
            {
                id: "d1",
                assetId: "door",
                tileX: 4,
                tileY: 2,
                offsetX: 0,
                offsetY: 0,
                parentId: null,
                propertyOverrides: null,
            },
        ],
        library: { ...base.library, assets: [doorAsset] },
    };
};

describe("ZoneDragController room with doors", () => {
    it("refuses moving a room so its door ends up outside", () => {
        const { controller, dispatch, hints, at } = setup(roomWithDoor());

        controller.pressBody(at([4, 4]), toZoneSelectionId(2));
        controller.onPointerUp(at([4, 8]));

        expect(dispatch).not.toHaveBeenCalled();
        expect(hints).toContain(ZONE_MESSAGES.ROOM_DOORS_LEFT_OUT);
    });

    it("allows a small move that keeps the door on the border", () => {
        const { controller, dispatch, at } = setup(roomWithDoor());

        controller.pressBody(at([4, 4]), toZoneSelectionId(2));
        controller.onPointerUp(at([5, 4]));

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("refuses resizing a room so its door ends up outside", () => {
        const { controller, store, dispatch, hints, at } =
            setup(roomWithDoor());
        store.setSelection([toZoneSelectionId(2)]);

        // The north west corner is at (3, 3) tiles. Dragging it to (3, 6)
        // shrinks the room away from the door.
        const pressed = controller.pressHandle({
            ...at([3, 3]),
            worldX: 3 * 32,
            worldY: 3 * 32,
        });
        controller.onPointerUp(at([3, 6]));

        expect(pressed).toBe(true);
        expect(dispatch).not.toHaveBeenCalled();
        expect(hints).toContain(ZONE_MESSAGES.ROOM_DOORS_LEFT_OUT);
    });
});

describe("EditorStore zone actions", () => {
    it("removes the selected zone as one gesture and undoes it", () => {
        const { store, draft, zone } = setup(model());
        store.setSelection([toZoneSelectionId(2)]);

        store.removeSelection();

        expect(zone(2)).toBeUndefined();
        expect(store.getState().selection).toEqual([]);
        draft.undo();
        expect(zone(2)).toBeDefined();
    });

    it("refuses to remove the last spawn and says why", () => {
        const { store, zone } = setup(model());
        store.setSelection([toZoneSelectionId(1)]);

        store.removeSelection();

        expect(zone(1)).toBeDefined();
        expect(store.getState().selectionNotice).toBe(ZONE_MESSAGES.LAST_SPAWN);
        expect(store.getState().selection).toEqual([toZoneSelectionId(1)]);

        store.clearSelection();
        expect(store.getState().selectionNotice).toBeNull();
    });

    it("renames the selected area", () => {
        const { store, zone } = setup(model());
        store.setSelection([toZoneSelectionId(2)]);

        store.renameSelectedZone("Copa");

        expect(zone(2)?.label).toBe("Copa");
    });
});
