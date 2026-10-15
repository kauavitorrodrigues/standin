import { describe, expect, it } from "vitest";
import type { ModelDesk } from "@standin/contracts";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

const setup = (
    placed = [placedAt("a", "crate", 2, 4)],
    desks: ModelDesk[] = []
) => {
    const draft = createDraftStore({ ...buildModel(placed), desks });
    const store = createEditorStore();
    store.attachSelectionHost({
        getModel: () => draft.getState().draft,
        dispatch: draft.dispatchGesture,
    });
    return { draft, store };
};

const tile = (draft: ReturnType<typeof setup>["draft"], id: string) => {
    const found = draft.getState().draft.placed.find((p) => p.id === id);
    return found ? [found.tileX, found.tileY] : null;
};

describe("EditorStore moveSelection", () => {
    it("moves the selected object one tile as one undo step", () => {
        const { draft, store } = setup();
        store.setSelection(["a"]);

        store.moveSelection("right");
        store.moveSelection("up");

        expect(tile(draft, "a")).toEqual([3, 3]);
        expect(draft.getState().undo).toHaveLength(2);

        draft.undo();
        expect(tile(draft, "a")).toEqual([3, 4]);
    });

    it("does not move into a refused spot", () => {
        const { draft, store } = setup([
            placedAt("a", "crate", 2, 4),
            placedAt("b", "crate", 3, 4),
        ]);
        store.setSelection(["a"]);

        store.moveSelection("right");

        expect(tile(draft, "a")).toEqual([2, 4]);
        expect(draft.getState().undo).toHaveLength(0);
    });

    it("does nothing without a selection or without the lock", () => {
        const { draft, store } = setup();
        store.moveSelection("down");
        expect(tile(draft, "a")).toEqual([2, 4]);

        store.setSelection(["a"]);
        store.setLockStatus("lost");
        store.moveSelection("down");
        expect(tile(draft, "a")).toEqual([2, 4]);
    });

    it("does nothing while a publish runs", () => {
        const { draft, store } = setup();
        store.setSelection(["a"]);
        store.beginPublish();
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.PUBLISHING);

        store.moveSelection("down");

        expect(tile(draft, "a")).toEqual([2, 4]);
    });
});

describe("EditorStore removeSelection", () => {
    it("removes the selected object and clears the selection", () => {
        const { draft, store } = setup();
        store.setSelection(["a"]);

        store.removeSelection();

        expect(tile(draft, "a")).toBeNull();
        expect(store.getState().selection).toEqual([]);

        draft.undo();
        expect(tile(draft, "a")).toEqual([2, 4]);
    });

    it("asks for confirmation on a claimed desk and removes nothing", () => {
        const { draft, store } = setup(
            [placedAt("desk-1", "desk", 2, 4)],
            [{ mapAssetId: "desk-1", userId: "user-1" }]
        );
        store.setSelection(["desk-1"]);

        store.removeSelection();

        expect(tile(draft, "desk-1")).toEqual([2, 4]);
        expect(draft.getState().undo).toHaveLength(0);
        expect(store.getState().pendingDeskRemoval).toEqual(["desk-1"]);

        store.cancelDeskRemoval();
        expect(store.getState().pendingDeskRemoval).toEqual([]);
    });

    it("removes a desk nobody claimed", () => {
        const { draft, store } = setup([placedAt("desk-1", "desk", 2, 4)]);
        store.setSelection(["desk-1"]);

        store.removeSelection();

        expect(tile(draft, "desk-1")).toBeNull();
    });

    it("does nothing after the host is detached", () => {
        const { draft, store } = setup();
        const detach = store.attachSelectionHost({
            getModel: () => draft.getState().draft,
            dispatch: draft.dispatchGesture,
        });
        detach();
        store.setSelection(["a"]);

        store.removeSelection();

        expect(tile(draft, "a")).toEqual([2, 4]);
    });
});

describe("EditorStore panel tab", () => {
    it("starts on the objects tab and follows the panel", () => {
        const store = createEditorStore();
        expect(store.getState().panelTab).toBe(PANEL_TABS.OBJECTS);

        store.setPanelTab(PANEL_TABS.TILES);
        expect(store.getState().panelTab).toBe(PANEL_TABS.TILES);
    });
});
