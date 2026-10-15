import { describe, expect, it } from "vitest";
import type {
    EditorModel,
    EditorOp,
    LibraryPalette,
    MapLayout,
} from "@standin/contracts";
import { EDITOR_DEFAULT_BACKGROUND_COLOR } from "@standin/contracts";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import type { DraftSummary } from "@/features/editor/types/DraftSummary";

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
        areas: [],
    } as unknown as LibraryPalette,
    desks: [],
    limits: { objectsUsed: 0, objectsMax: 10 },
    version: 3,
});

const background = (color: string): EditorOp => ({
    type: "set_background",
    color,
});

const track = () => {
    let summary: DraftSummary | null = null;
    const base = buildBase();
    base.layout = {
        ...base.layout,
        backgroundcolor: EDITOR_DEFAULT_BACKGROUND_COLOR,
    } as unknown as MapLayout;
    const store = createDraftStore(base, (next) => {
        summary = next;
    });
    return { store, summary: () => summary };
};

describe("draft summary hasChanges", () => {
    it("has changes after a gesture", () => {
        const { store, summary } = track();
        store.dispatchGesture([background("#111111"), background("#222222")]);
        expect(summary()).toMatchObject({ hasChanges: true, canUndo: true });
    });

    it("has changes for restored operations, with nothing to undo", () => {
        const { store, summary } = track();
        const result = store.restore([
            background("#111111"),
            background("#222222"),
        ]);
        expect(result.ok).toBe(true);
        expect(summary()).toMatchObject({ hasChanges: true, canUndo: false });
    });

    it("has no changes when discarded", () => {
        const { store, summary } = track();
        store.restore([background("#111111")]);
        store.discard();
        expect(summary()).toMatchObject({ hasChanges: false });
    });
});

describe("draft summary when the draft equals the published map", () => {
    it("has no changes after an edit is reverted by another gesture", () => {
        const { store, summary } = track();
        store.dispatchGesture([background("#111111")]);
        expect(summary()?.hasChanges).toBe(true);

        store.dispatchGesture([
            {
                type: "set_background",
                color: EDITOR_DEFAULT_BACKGROUND_COLOR,
            },
        ]);
        expect(summary()?.hasChanges).toBe(false);
        expect(summary()?.canUndo).toBe(true);
    });

    it("has changes again once the draft differs from the base", () => {
        const { store, summary } = track();
        store.dispatchGesture([background("#111111")]);
        store.dispatchGesture([
            {
                type: "set_background",
                color: EDITOR_DEFAULT_BACKGROUND_COLOR,
            },
        ]);
        store.dispatchGesture([background("#222222")]);
        expect(summary()?.hasChanges).toBe(true);
    });
});
