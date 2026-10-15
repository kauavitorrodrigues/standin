import { describe, expect, it } from "vitest";
import type { ModelDesk } from "@standin/contracts";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import {
    buildToolbarModel,
    placedAt,
} from "@/features/editor/utils/__tests__/objectToolbarKit";

const setup = (
    placed = [placedAt("a", "sofa", 2, 4)],
    desks: ModelDesk[] = []
) => {
    const draft = createDraftStore(buildToolbarModel(placed, undefined, desks));
    const store = createEditorStore();
    store.attachSelectionHost({
        getModel: () => draft.getState().draft,
        dispatch: draft.dispatchGesture,
    });
    return { draft, store };
};

const assetOf = (draft: ReturnType<typeof setup>["draft"], id: string) =>
    draft.getState().draft.placed.find((p) => p.id === id)?.assetId ?? null;

describe("EditorStore replaceSelection", () => {
    it("swaps the model or the color as one undo step", () => {
        const { draft, store } = setup();
        store.setSelection(["a"]);

        store.replaceSelection("sofa-blue");

        expect(assetOf(draft, "a")).toBe("sofa-blue");
        expect(draft.getState().undo).toHaveLength(1);
        draft.undo();
        expect(assetOf(draft, "a")).toBe("sofa");
    });

    it("changes nothing when the swap is refused or nothing is selected", () => {
        const { draft, store } = setup();

        store.replaceSelection("sofa-blue");
        store.setSelection(["a"]);
        store.replaceSelection("lamp");

        expect(assetOf(draft, "a")).toBe("sofa");
        expect(draft.getState().undo).toHaveLength(0);
    });

    it("does nothing without the lock", () => {
        const { draft, store } = setup();
        store.setSelection(["a"]);
        store.setLockStatus("lost");

        store.replaceSelection("sofa-blue");

        expect(assetOf(draft, "a")).toBe("sofa");
    });
});

describe("EditorStore rotateSelection", () => {
    it("turns the object to the next rotation, as one gesture", () => {
        const { draft, store } = setup();
        store.setSelection(["a"]);

        store.rotateSelection();

        expect(assetOf(draft, "a")).toBe("sofa-90");
        expect(draft.getState().undo).toHaveLength(1);
    });

    it("does nothing for an object with a single rotation", () => {
        const { draft, store } = setup([placedAt("a", "lamp", 2, 4)]);
        store.setSelection(["a"]);

        store.rotateSelection();

        expect(assetOf(draft, "a")).toBe("lamp");
        expect(draft.getState().undo).toHaveLength(0);
    });
});

describe("EditorStore confirmDeskRemoval", () => {
    const claimed = () =>
        setup(
            [placedAt("d1", "desk", 2, 4)],
            [{ mapAssetId: "d1", userId: "u1" }]
        );

    it("removes the desk with releaseDesk and frees the claim", () => {
        const { draft, store } = claimed();
        store.setSelection(["d1"]);
        store.removeSelection();
        expect(store.getState().pendingDeskRemoval).toEqual(["d1"]);

        store.confirmDeskRemoval();

        const model = draft.getState().draft;
        expect(model.placed).toHaveLength(0);
        expect(model.desks).toHaveLength(0);
        expect(draft.getState().ops).toEqual([
            { type: "remove_asset", id: "d1", releaseDesk: true },
        ]);
        expect(draft.getState().undo).toHaveLength(1);
        expect(store.getState().pendingDeskRemoval).toEqual([]);
        expect(store.getState().selection).toEqual([]);
    });

    it("undo brings the desk back but not its owner", () => {
        const { draft, store } = claimed();
        store.setSelection(["d1"]);
        store.removeSelection();
        store.confirmDeskRemoval();

        draft.undo();

        const model = draft.getState().draft;
        expect(model.placed.map(({ id }) => id)).toEqual(["d1"]);
        expect(model.desks).toEqual([]);
    });

    it("cancel removes nothing", () => {
        const { draft, store } = claimed();
        store.setSelection(["d1"]);
        store.removeSelection();

        store.cancelDeskRemoval();

        expect(draft.getState().draft.placed).toHaveLength(1);
        expect(draft.getState().undo).toHaveLength(0);
        expect(store.getState().pendingDeskRemoval).toEqual([]);
    });

    it("does nothing when no request is pending", () => {
        const { draft, store } = claimed();

        store.confirmDeskRemoval();

        expect(draft.getState().draft.placed).toHaveLength(1);
    });
});

describe("EditorStore copy and paste", () => {
    it("copies the asset of the selected object and pastes it as placing", () => {
        const { store } = setup();
        store.setSelection(["a"]);

        store.copySelection();
        store.clearSelection();
        store.pasteSelection();

        expect(store.getState().clipboard).toBe("sofa");
        expect(store.getState().placing).toBe("sofa");
        expect(store.getState().tool).toBe(EDITOR_TOOLS.SELECT);
    });

    it("copy does nothing without a selection", () => {
        const { store } = setup();

        store.copySelection();

        expect(store.getState().clipboard).toBeNull();
    });

    it("paste does nothing without a copy or without the lock", () => {
        const { store } = setup();
        store.pasteSelection();
        expect(store.getState().placing).toBeNull();

        store.setSelection(["a"]);
        store.copySelection();
        store.setLockStatus("lost");
        store.pasteSelection();
        expect(store.getState().placing).toBeNull();
    });

    it("copy keeps the previous copy when the selection is not an object", () => {
        const { store } = setup();
        store.setSelection(["a"]);
        store.copySelection();

        store.setSelection(["zone-1"]);
        store.copySelection();

        expect(store.getState().clipboard).toBe("sofa");
    });
});
