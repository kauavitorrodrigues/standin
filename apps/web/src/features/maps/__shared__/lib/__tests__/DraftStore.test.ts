import { describe, expect, it, vi } from "vitest";
import { UNDO_STACK_LIMIT } from "@standin/contracts";
import type {
    EditorModel,
    EditorOp,
    LibraryPalette,
    MapLayout,
} from "@standin/contracts";
import { createDraftStore } from "@/features/maps/__shared__/lib/DraftStore";

const buildBase = (): EditorModel => ({
    mapId: "map-1",
    width: 4,
    height: 4,
    layout: {
        width: 4,
        height: 4,
        layers: [],
        tilesets: [],
    } as unknown as MapLayout,
    placed: [],
    library: {
        tilesets: [],
        assets: [],
        categories: [],
    } as unknown as LibraryPalette,
    desks: [],
    limits: { objectsUsed: 0, objectsMax: 10 },
    version: 3,
});

const background = (color: string): EditorOp => ({
    type: "set_background",
    color,
});

// An operation the engine does not support yet, so the gesture fails.
const invalid = (): EditorOp => ({
    type: "place_asset",
    tempId: "temp-1",
    assetId: "asset-1",
    tileX: 0,
    tileY: 0,
});

const colorOf = (store: ReturnType<typeof createDraftStore>) =>
    store.getState().draft.layout.backgroundcolor;

describe("DraftStore", () => {
    it("applies a gesture and records it", () => {
        const store = createDraftStore(buildBase());

        const result = store.dispatchGesture([background("#111111")]);

        expect(result.ok).toBe(true);
        expect(colorOf(store)).toBe("#111111");
        expect(store.getState().ops).toEqual([background("#111111")]);
        expect(store.getState().undo).toHaveLength(1);
    });

    it("undoes and redoes", () => {
        const store = createDraftStore(buildBase());
        store.dispatchGesture([background("#111111")]);

        store.undo();
        expect(colorOf(store)).toBe("#000000");
        expect(store.getState().ops).toEqual([]);
        expect(store.getState().redo).toHaveLength(1);

        store.redo();
        expect(colorOf(store)).toBe("#111111");
        expect(store.getState().ops).toEqual([background("#111111")]);
        expect(store.getState().redo).toHaveLength(0);
    });

    it("leaves no changes after undoing everything", () => {
        const onSummary = vi.fn();
        const store = createDraftStore(buildBase(), onSummary);
        store.dispatchGesture([background("#111111")]);
        store.dispatchGesture([background("#222222")]);

        store.undo();
        store.undo();

        expect(store.getState().ops).toEqual([]);
        expect(onSummary).toHaveBeenLastCalledWith({
            hasChanges: false,
            canUndo: false,
            canRedo: true,
        });
    });

    it("clears the redo on a new gesture", () => {
        const store = createDraftStore(buildBase());
        store.dispatchGesture([background("#111111")]);
        store.undo();

        store.dispatchGesture([background("#222222")]);

        expect(store.getState().redo).toEqual([]);
    });

    it("drops the oldest entry past the limit", () => {
        const store = createDraftStore(buildBase());
        for (let i = 0; i < UNDO_STACK_LIMIT + 5; i += 1) {
            store.dispatchGesture([
                background(`#${String(i).padStart(6, "0")}`),
            ]);
        }

        expect(store.getState().undo).toHaveLength(UNDO_STACK_LIMIT);
        expect(store.getState().ops).toHaveLength(UNDO_STACK_LIMIT + 5);
    });

    it("changes nothing when one operation of the gesture is invalid", () => {
        const store = createDraftStore(buildBase());
        store.dispatchGesture([background("#111111")]);
        const before = store.getState();
        const listener = vi.fn();
        store.subscribe(listener);

        const result = store.dispatchGesture([
            background("#222222"),
            invalid(),
        ]);

        expect(result.ok).toBe(false);
        expect(store.getState()).toBe(before);
        expect(listener).not.toHaveBeenCalled();
    });

    it("discard goes back to the base", () => {
        const base = buildBase();
        const store = createDraftStore(base);
        store.dispatchGesture([background("#111111")]);
        store.undo();
        store.dispatchGesture([background("#222222")]);

        store.discard();

        expect(store.getState().draft).toBe(base);
        expect(store.getState().ops).toEqual([]);
        expect(store.getState().undo).toEqual([]);
        expect(store.getState().redo).toEqual([]);
    });

    it("reports changes after one gesture of several operations", () => {
        const onSummary = vi.fn();
        const store = createDraftStore(buildBase(), onSummary);

        store.dispatchGesture([background("#111111"), background("#222222")]);

        expect(store.getState().ops).toHaveLength(2);
        expect(onSummary).toHaveBeenLastCalledWith({
            hasChanges: true,
            canUndo: true,
            canRedo: false,
        });
    });

    it("undoes a whole gesture at once", () => {
        const store = createDraftStore(buildBase());
        store.dispatchGesture([background("#111111"), background("#222222")]);

        store.undo();

        expect(colorOf(store)).toBe("#000000");
        expect(store.getState().ops).toEqual([]);
    });

    it("notifies on change and stays quiet when nothing changes", () => {
        const store = createDraftStore(buildBase());
        const listener = vi.fn();
        store.subscribe(listener);

        store.undo();
        store.redo();
        store.discard();
        store.dispatchGesture([]);
        expect(listener).not.toHaveBeenCalled();

        store.dispatchGesture([background("#111111")]);
        expect(listener).toHaveBeenCalledTimes(1);
    });
    describe("restore", () => {
        it("reapplies the saved operations with no history", () => {
            const store = createDraftStore(buildBase());

            const result = store.restore([
                background("#111111"),
                background("#222222"),
            ]);

            expect(result.ok).toBe(true);
            expect(colorOf(store)).toBe("#222222");
            expect(store.getState().ops).toHaveLength(2);
            expect(store.getState().undo).toEqual([]);
            expect(store.getState().redo).toEqual([]);
        });

        it("answers the index of the failing operation and keeps the draft", () => {
            const store = createDraftStore(buildBase());

            const result = store.restore([background("#111111"), invalid()]);

            expect(result.ok).toBe(false);
            if (!result.ok) expect(result.opIndex).toBe(1);
            expect(store.getState().ops).toEqual([]);
            expect(colorOf(store)).toBeUndefined();
        });

        it("tells the summary the restored operations are changes, with nothing to undo", () => {
            const onSummary = vi.fn();
            const store = createDraftStore(buildBase(), onSummary);

            store.restore([background("#111111")]);

            expect(onSummary).toHaveBeenLastCalledWith({
                hasChanges: true,
                canUndo: false,
                canRedo: false,
            });
        });
    });

    describe("rebase", () => {
        it("swaps the base and clears the draft and the history", () => {
            const store = createDraftStore(buildBase());
            store.dispatchGesture([background("#111111")]);
            const next = { ...buildBase(), version: 4 };

            store.rebase(next);

            const state = store.getState();
            expect(state.base).toBe(next);
            expect(state.draft).toBe(next);
            expect(state.ops).toEqual([]);
            expect(state.undo).toEqual([]);
            expect(state.redo).toEqual([]);
        });
    });
});
