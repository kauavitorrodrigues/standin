import { beforeEach, describe, expect, it } from "vitest";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { DEFAULT_EDITOR_VIEW_PREFERENCES } from "@/features/editor/consts/editorViewPreferences";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import { editorViewPreference } from "@/features/editor/lib/editorViewPreferences";
import type { PlacingArea } from "@/features/editor/types/placing-area";

beforeEach(() => {
    editorViewPreference.set(DEFAULT_EDITOR_VIEW_PREFERENCES);
});

const placingArea = {
    area: { id: "area-1", version: 1 },
    stamp: { width: 2, height: 2 },
} as unknown as PlacingArea;

describe("EditorStore area placing", () => {
    it("starts and cancels placing an area", () => {
        const store = createEditorStore();

        store.startPlacingArea(placingArea);
        expect(store.getState().placingArea).toBe(placingArea);

        store.cancelPlacingArea();
        expect(store.getState().placingArea).toBeNull();
    });

    it("keeps the area or the asset, never both", () => {
        const store = createEditorStore();

        store.startPlacing("tree");
        store.startPlacingArea(placingArea);
        expect(store.getState()).toMatchObject({
            placing: null,
            placingArea,
        });

        store.startPlacing("tree");
        expect(store.getState()).toMatchObject({
            placing: "tree",
            placingArea: null,
        });
    });

    it("leaves the mode on a tool choice, on Esc and without the lock", () => {
        const store = createEditorStore();

        store.startPlacingArea(placingArea);
        store.setTool(EDITOR_TOOLS.SELECT);
        expect(store.getState().placingArea).toBeNull();

        store.startPlacingArea(placingArea);
        store.clearSelectionAndPlacing();
        expect(store.getState().placingArea).toBeNull();

        store.startPlacingArea(placingArea);
        store.setLockStatus(LOCK_STATUS.LOST);
        expect(store.getState().placingArea).toBeNull();
    });

    it("refuses to start without the lock", () => {
        const store = createEditorStore();
        store.setLockStatus(LOCK_STATUS.LOST);

        store.startPlacingArea(placingArea);

        expect(store.getState().placingArea).toBeNull();
    });
});
