import { describe, expect, it, vi, beforeEach } from "vitest";
import { EDITOR_STATUS } from "@/features/editor/consts/status";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import { DEFAULT_EDITOR_VIEW_PREFERENCES } from "@/features/editor/consts/editorViewPreferences";
import { editorViewPreference } from "@/features/editor/lib/editorViewPreferences";
// The view choices are remembered across editors, so each case starts from the defaults.
beforeEach(() => {
    editorViewPreference.set(DEFAULT_EDITOR_VIEW_PREFERENCES);
});

describe("EditorStore", () => {
    it("starts with the grid on, the panel open and the editor loading", () => {
        const state = createEditorStore().getState();

        expect(state.gridVisible).toBe(true);
        expect(state.panelOpen).toBe(true);
        expect(state.status).toBe(EDITOR_STATUS.LOADING);
        expect(state.selection).toEqual([]);
    });

    it("applies each action", () => {
        const store = createEditorStore();

        store.setTool(EDITOR_TOOLS.PAINT);
        store.setSelection(["a", "b"]);
        store.setZoom(3);
        store.setStatus(EDITOR_STATUS.READY);
        store.toggleGrid();
        store.togglePanel();

        expect(store.getState()).toMatchObject({
            tool: EDITOR_TOOLS.PAINT,
            selection: ["a", "b"],
            zoom: 3,
            status: EDITOR_STATUS.READY,
            gridVisible: false,
            panelOpen: false,
        });

        store.clearSelection();
        expect(store.getState().selection).toEqual([]);
    });

    it("leaves the placing mode when a tool is chosen, even the same one", () => {
        const store = createEditorStore();
        store.setTool(EDITOR_TOOLS.SELECT);
        store.startPlacing("tree");

        store.setTool(EDITOR_TOOLS.SELECT);

        expect(store.getState().placing).toBeNull();
    });

    it("keeps the selection on pan and select and drops it on other tools", () => {
        const store = createEditorStore();
        store.setSelection(["a"]);

        store.setTool(EDITOR_TOOLS.PAN);
        store.setTool(EDITOR_TOOLS.SELECT);
        expect(store.getState().selection).toEqual(["a"]);

        store.setTool(EDITOR_TOOLS.PAINT);
        expect(store.getState().selection).toEqual([]);
    });

    it("clears the placing mode and the selection together", () => {
        const store = createEditorStore();
        store.startPlacing("tree");
        store.setSelection(["a"]);

        store.clearSelectionAndPlacing();

        expect(store.getState()).toMatchObject({
            placing: null,
            selection: [],
            tool: store.getState().tool,
        });
    });

    it("notifies subscribers when the state changes", () => {
        const store = createEditorStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.setTool(EDITOR_TOOLS.ERASE);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("does not notify when nothing changes", () => {
        const store = createEditorStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.setTool(store.getState().tool);
        store.setGridVisible(true);
        store.setZoom(store.getState().zoom);
        store.setSelection(["a"]);
        listener.mockClear();
        store.setSelection(["a"]);
        store.clearSelection();
        store.clearSelection();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("keeps the same state object when nothing changes", () => {
        const store = createEditorStore();
        const before = store.getState();

        store.setPanelOpen(true);

        expect(store.getState()).toBe(before);
    });

    it("stops notifying after unsubscribe", () => {
        const store = createEditorStore();
        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);

        unsubscribe();
        store.toggleGrid();

        expect(listener).not.toHaveBeenCalled();
    });

    it("lets a selector read a field", () => {
        const store = createEditorStore();
        const select = (state: ReturnType<typeof store.getState>) => state.zoom;
        const before = select(store.getState());

        store.setTool(EDITOR_TOOLS.PICKER);

        expect(select(store.getState())).toBe(before);
    });
});

describe("EditorStore draft summary", () => {
    it("starts empty, applies the summary and ignores an equal one", () => {
        const store = createEditorStore();
        const listener = vi.fn();
        store.subscribe(listener);
        expect(store.getState().draft).toEqual({
            hasChanges: false,
            canUndo: false,
            canRedo: false,
        });

        const summary = {
            hasChanges: true,
            canUndo: true,
            canRedo: false,
        };
        store.setDraftSummary(summary);
        store.setDraftSummary({ ...summary });

        expect(store.getState().draft).toEqual(summary);
        expect(listener).toHaveBeenCalledTimes(1);
    });
});

describe("EditorStore zones and pending actions", () => {
    it("toggles the zones and keeps the pending actions harmless", () => {
        const store = createEditorStore();
        const before = store.getState();
        expect(before.zonesVisible).toBe(true);

        store.toggleZones();
        expect(store.getState().zonesVisible).toBe(false);

        const listener = vi.fn();
        store.subscribe(listener);
        store.rotateSelection();
        store.removeSelection();
        store.moveSelection("up");
        store.copySelection();
        store.pasteSelection();
        store.requestPublish();
        expect(listener).not.toHaveBeenCalled();
    });

    it("starts and cancels placing", () => {
        const store = createEditorStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.startPlacing("asset-1");
        expect(store.getState().placing).toBe("asset-1");

        store.cancelPlacing();
        store.cancelPlacing();
        expect(store.getState().placing).toBeNull();
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it("picks a tile for the brush and ignores the same pick", () => {
        const store = createEditorStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.pickTile({ tilesetId: "t1", tileIndex: 4 });
        store.pickTile({ tilesetId: "t1", tileIndex: 4 });

        expect(store.getState().brush).toEqual({
            tilesetId: "t1",
            tileIndex: 4,
        });
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
