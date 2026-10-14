// @vitest-environment jsdom
import { act, createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
    EditorModel,
    EditorOp,
    LibraryPalette,
    MapLayout,
} from "@standin/contracts";
import { RESUME_DECISION } from "@/features/maps/__shared__/consts/resume-decision";
import { DraftStoreContext } from "@/features/maps/__shared__/contexts/DraftStoreContext";
import { useResumeDraft } from "@/features/maps/__shared__/hooks/useResumeDraft";
import { createDraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import type { DraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";

const db = vi.hoisted(() => ({
    getDraft: vi.fn(),
    clearDraft: vi.fn(async () => ({ ok: true, value: undefined })),
}));

vi.mock("@/features/maps/__shared__/lib/draftDb", () => db);
vi.mock("@/features/auth/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "user-1" } }),
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: vi.fn() } }));

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
let latest: ReturnType<typeof useResumeDraft>;

const Probe = () => {
    const value = useResumeDraft();
    useEffect(() => {
        latest = value;
    });
    return null;
};

const mount = async () => {
    await act(async () => {
        root.render(
            createElement(
                DraftStoreContext.Provider,
                { value: store },
                createElement(Probe)
            )
        );
    });
};

const stored = (baseVersion: number): StoredDraft => ({
    baseVersion,
    ops: [background("#111111"), background("#222222")],
});

describe("useResumeDraft settled", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        db.getDraft.mockReset();
        db.clearDraft.mockClear();
        store = createDraftStore(buildBase());
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("is settled when there was no saved draft", async () => {
        db.getDraft.mockResolvedValue({ ok: true, value: null });
        await mount();
        expect(latest.decision.kind).toBe(RESUME_DECISION.NONE);
        expect(latest.settled).toBe(true);
    });

    it("is settled when the storage fails", async () => {
        db.getDraft.mockResolvedValue({ ok: false });
        await mount();
        expect(latest.settled).toBe(true);
    });

    it("is not settled while a saved draft waits for the answer", async () => {
        db.getDraft.mockResolvedValue({ ok: true, value: stored(3) });
        await mount();
        expect(latest.decision.kind).toBe(RESUME_DECISION.OFFER);
        expect(latest.settled).toBe(false);
    });

    it("settles after resuming, with the operations back and the count right", async () => {
        db.getDraft.mockResolvedValue({ ok: true, value: stored(3) });
        await mount();
        await act(async () => {
            await latest.resume();
        });
        expect(latest.settled).toBe(true);
        expect(store.getState().ops).toHaveLength(2);
        expect(db.clearDraft).not.toHaveBeenCalled();
    });

    it("settles after discarding, and clears the saved copy", async () => {
        db.getDraft.mockResolvedValue({ ok: true, value: stored(2) });
        await mount();
        expect(latest.decision.kind).toBe(RESUME_DECISION.STALE);
        expect(latest.settled).toBe(false);

        await act(async () => {
            await latest.discard();
        });
        expect(latest.settled).toBe(true);
        expect(db.clearDraft).toHaveBeenCalledWith("user-1", "map-1");
    });
});
