// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
    EditorModel,
    EditorOp,
    LibraryPalette,
    MapLayout,
} from "@standin/contracts";
import { DRAFT_SAVE_DELAY_MS } from "@/features/maps/__shared__/consts/draft";
import { useDraftPersistence } from "@/features/maps/__shared__/hooks/useDraftPersistence";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import type { DraftStore } from "@/features/editor/lib/DraftStore";

const db = vi.hoisted(() => ({
    saveDraft: vi.fn(async () => ({ ok: true, value: undefined })),
    clearDraft: vi.fn(async () => ({ ok: true, value: undefined })),
}));

vi.mock("@/features/maps/__shared__/lib/draftDb", () => db);

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

let root: Root;
let store: DraftStore;

const Probe = ({ enabled }: { enabled: boolean }) => {
    useDraftPersistence(store, "user-1", "map-1", enabled);
    return null;
};

const render = (enabled: boolean) => {
    act(() => {
        root.render(createElement(Probe, { enabled }));
    });
};

const flushSave = () => {
    act(() => {
        vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS);
    });
};

describe("useDraftPersistence", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.useFakeTimers();
        db.saveDraft.mockClear();
        db.clearDraft.mockClear();
        store = createDraftStore(buildBase());
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("writes nothing before the decision", () => {
        render(false);
        store.dispatchGesture([background("#111111")]);
        flushSave();
        expect(db.saveDraft).not.toHaveBeenCalled();
        expect(db.clearDraft).not.toHaveBeenCalled();
    });

    it("writes the effective operations after the decision, with the delay", () => {
        render(true);
        store.dispatchGesture([background("#111111")]);
        expect(db.saveDraft).not.toHaveBeenCalled();

        flushSave();
        expect(db.saveDraft).toHaveBeenCalledWith("user-1", "map-1", {
            baseVersion: 3,
            ops: [background("#111111")],
        });
    });

    it("clears the record when the operations run out", () => {
        render(true);
        store.dispatchGesture([background("#111111")]);
        flushSave();

        store.undo();
        expect(db.clearDraft).toHaveBeenCalledWith("user-1", "map-1");
    });

    it("does not clear or write the resumed operations, then saves the next edit", () => {
        render(false);
        store.restore([background("#111111")]);
        render(true);
        flushSave();
        expect(db.saveDraft).not.toHaveBeenCalled();
        expect(db.clearDraft).not.toHaveBeenCalled();

        store.dispatchGesture([background("#222222")]);
        flushSave();
        expect(db.saveDraft).toHaveBeenCalledWith("user-1", "map-1", {
            baseVersion: 3,
            ops: [background("#111111"), background("#222222")],
        });
    });

    it("clears the record after a discard", () => {
        render(true);
        store.dispatchGesture([background("#111111")]);
        flushSave();

        store.discard();
        expect(db.clearDraft).toHaveBeenCalledTimes(1);
    });
});
