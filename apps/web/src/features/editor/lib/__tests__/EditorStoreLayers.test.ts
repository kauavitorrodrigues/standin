import { describe, expect, it, vi } from "vitest";
import { LAYOUT_LAYER_NAMES } from "@standin/contracts";
import { createEditorStore } from "@/features/editor/lib/EditorStore";

describe("EditorStore layers", () => {
    it("starts with every layer visible", () => {
        const state = createEditorStore().getState();

        expect(Object.values(state.layerVisibility)).toEqual([
            true,
            true,
            true,
            true,
        ]);
    });

    it("hides and shows one layer without touching the others", () => {
        const store = createEditorStore();

        store.toggleLayerVisible(LAYOUT_LAYER_NAMES.WALLS);
        expect(store.getState().layerVisibility).toMatchObject({
            walls: false,
            ground: true,
            furniture: true,
            foreground: true,
        });

        store.setLayerVisible(LAYOUT_LAYER_NAMES.WALLS, true);
        expect(store.getState().layerVisibility.walls).toBe(true);
    });

    it("does not notify when nothing changes", () => {
        const store = createEditorStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.setLayerVisible(LAYOUT_LAYER_NAMES.GROUND, true);

        expect(listener).not.toHaveBeenCalled();
    });
});
