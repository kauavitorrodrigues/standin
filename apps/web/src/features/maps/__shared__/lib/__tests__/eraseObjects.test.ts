import { describe, expect, it, vi } from "vitest";
import type { Cell, EditorModel } from "@standin/contracts";
import { DEFAULT_LAYER_VISIBILITY } from "@/features/maps/__shared__/consts/layers";
import { PANEL_TABS } from "@/features/maps/__shared__/consts/panelTabs";
import { createDraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import { createEraseController } from "@/features/maps/__shared__/lib/createEraseController";
import type { ToolContext } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import {
    buildModel,
    placedAt,
} from "@/features/maps/__shared__/utils/__tests__/placementTestKit";

const preview = vi.hoisted(() => ({
    add: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock("@/features/maps/__shared__/lib/TilePreview", () => ({
    TilePreview: class {
        add = preview.add;
        set = preview.set;
        clear = preview.clear;
        destroy = preview.destroy;
    },
}));

const setup = (model: EditorModel, panelTab: string) => {
    const draft = createDraftStore(model);
    const requestDeskRemoval = vi.fn();
    const store = {
        getState: () => ({
            panelTab,
            layerVisibility: DEFAULT_LAYER_VISIBILITY,
            brush: null,
        }),
        subscribe: () => () => undefined,
        requestDeskRemoval,
    };
    const hints: (string | null)[] = [];
    const setHint = (text: string | null) => hints.push(text);
    const scene = { textures: { exists: () => false } };
    const env = { scene, store, setHint } as unknown as ToolEnv;
    const controller = createEraseController(env);

    const at = (cell: Cell): ToolContext => ({
        cell,
        worldX: cell[0] * 32 + 4,
        worldY: cell[1] * 32 + 4,
        button: 0,
        alt: false,
        shift: false,
        ctrl: false,
        model: draft.getState().draft,
        dispatch: draft.dispatchGesture,
        setHint,
    });
    const click = (cell: Cell) => {
        controller.onPointerDown?.(at(cell));
        controller.onPointerUp?.(at(cell));
    };

    return { draft, click, requestDeskRemoval };
};

describe("eraser by panel tab", () => {
    it("removes the object under the pointer on the Objects tab", () => {
        const model = buildModel([
            placedAt("a", "crate", 2, 4),
            placedAt("b", "crate", 6, 6),
        ]);
        const { draft, click } = setup(model, PANEL_TABS.OBJECTS);

        click([2, 4]);

        expect(draft.getState().draft.placed.map(({ id }) => id)).toEqual([
            "b",
        ]);
        expect(draft.getState().undo).toHaveLength(1);
        draft.undo();
        expect(draft.getState().draft.placed).toHaveLength(2);
    });

    it("does nothing on an empty cell of the Objects tab", () => {
        const model = buildModel([placedAt("a", "crate", 2, 4)]);
        const { draft, click } = setup(model, PANEL_TABS.OBJECTS);

        click([8, 8]);

        expect(draft.getState().undo).toHaveLength(0);
    });

    it("keeps erasing tiles on the Tiles tab and leaves the objects", () => {
        const model = buildModel([placedAt("a", "crate", 2, 4)]);
        const { draft, click } = setup(model, PANEL_TABS.TILES);

        click([2, 4]);

        expect(draft.getState().draft.placed).toHaveLength(1);
    });

    it("asks for confirmation instead of removing a claimed desk", () => {
        const model = {
            ...buildModel([placedAt("desk-1", "desk", 2, 4)]),
            desks: [{ mapAssetId: "desk-1", userId: "user-1" }],
        };
        const { draft, click, requestDeskRemoval } = setup(
            model,
            PANEL_TABS.OBJECTS
        );

        click([2, 4]);

        expect(draft.getState().draft.placed).toHaveLength(1);
        expect(requestDeskRemoval).toHaveBeenCalledWith(["desk-1"]);
    });
});
