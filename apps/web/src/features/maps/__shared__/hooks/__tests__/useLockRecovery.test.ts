// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
    EditorAcquireAck,
    EditorModel,
    LibraryPalette,
    MapLayout,
} from "@standin/contracts";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";
import { DraftStoreContext } from "@/features/editor/contexts/DraftStoreContext";
import { EditorLockContext } from "@/features/maps/__shared__/contexts/EditorLockContext";
import { EditorStoreContext } from "@/features/editor/contexts/EditorStoreContext";
import { useLockRecovery } from "@/features/maps/__shared__/hooks/useLockRecovery";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import type { EditorLockControl } from "@/features/maps/__shared__/types/EditorLockControl";

const mocks = vi.hoisted(() => ({
    getPublishedVersion: vi.fn(),
    toastAdd: vi.fn(),
}));

vi.mock("@/features/maps/__shared__/utils/getPublishedVersion", () => ({
    getPublishedVersion: mocks.getPublishedVersion,
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: mocks.toastAdd } }));

const GRANTED: EditorAcquireAck = {
    ok: true,
    heartbeatMs: 15000,
    ttlMs: 45000,
};
const DENIED: EditorAcquireAck = { ok: false, code: "MAP_LOCKED" };

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

let root: Root;
let editorStore: ReturnType<typeof createEditorStore>;
let control: {
    reacquire: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    markLost: ReturnType<typeof vi.fn>;
    release: ReturnType<typeof vi.fn>;
};

const Probe = () => {
    useLockRecovery();
    return null;
};

const mount = () => {
    const draftStore = createDraftStore(buildBase());
    act(() => {
        root.render(
            createElement(
                EditorStoreContext.Provider,
                { value: editorStore },
                createElement(
                    DraftStoreContext.Provider,
                    { value: draftStore },
                    createElement(
                        EditorLockContext.Provider,
                        { value: control as unknown as EditorLockControl },
                        createElement(Probe)
                    )
                )
            )
        );
    });
};

const lose = async () => {
    await act(async () => {
        editorStore.setLockStatus(LOCK_STATUS.LOST);
    });
};

const settle = async (ms: number) => {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
};

describe("useLockRecovery", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.useFakeTimers();
        mocks.getPublishedVersion.mockReset();
        mocks.toastAdd.mockReset();
        editorStore = createEditorStore();
        control = {
            reacquire: vi.fn(),
            restore: vi.fn(),
            markLost: vi.fn(),
            release: vi.fn(),
        };
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("does nothing while the lock is held", async () => {
        mount();
        await settle(20000);
        expect(control.reacquire).not.toHaveBeenCalled();
    });

    it("resumes when the lock is back and the version is the same", async () => {
        control.reacquire.mockResolvedValue(GRANTED);
        mocks.getPublishedVersion.mockResolvedValue(3);
        mount();

        await lose();
        await settle(0);

        expect(control.restore).toHaveBeenCalledTimes(1);
        expect(control.release).not.toHaveBeenCalled();
    });

    it("tries again after a network error and resumes", async () => {
        control.reacquire
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(GRANTED);
        mocks.getPublishedVersion.mockResolvedValue(3);
        mount();

        await lose();
        await settle(0);
        expect(control.reacquire).toHaveBeenCalledTimes(1);
        expect(control.restore).not.toHaveBeenCalled();

        await settle(1000);
        expect(control.reacquire).toHaveBeenCalledTimes(2);
        expect(control.restore).toHaveBeenCalledTimes(1);
    });

    it("stops and stays blocked when someone else got the lock", async () => {
        control.reacquire.mockResolvedValue(DENIED);
        mount();

        await lose();
        await settle(30000);

        expect(control.reacquire).toHaveBeenCalledTimes(1);
        expect(control.restore).not.toHaveBeenCalled();
        expect(control.release).not.toHaveBeenCalled();
        expect(mocks.toastAdd).toHaveBeenCalledTimes(1);
        expect(editorStore.getState().locked).toBe(true);
    });

    it("gives the lock back and stays blocked when the version changed", async () => {
        control.reacquire.mockResolvedValue(GRANTED);
        mocks.getPublishedVersion.mockResolvedValue(4);
        mount();

        await lose();
        await settle(30000);

        expect(control.restore).not.toHaveBeenCalled();
        expect(control.release).toHaveBeenCalledTimes(1);
        expect(control.reacquire).toHaveBeenCalledTimes(1);
    });

    it("gives up after the last try when the network never comes back", async () => {
        control.reacquire.mockResolvedValue(null);
        mount();

        await lose();
        await settle(60000);

        expect(control.reacquire.mock.calls.length).toBeGreaterThan(1);
        expect(control.restore).not.toHaveBeenCalled();
        expect(mocks.toastAdd).toHaveBeenCalledTimes(1);
    });

    it("marks the lock lost when the publish answers 423", async () => {
        mount();
        await act(async () => {
            editorStore.failPublish({
                kind: PUBLISH_ERROR_KIND.LOCK_LOST,
            } as never);
        });
        expect(control.markLost).toHaveBeenCalled();
    });

    it("clears the 423 failure when it resumes", async () => {
        control.reacquire.mockResolvedValue(GRANTED);
        mocks.getPublishedVersion.mockResolvedValue(3);
        mount();
        await act(async () => {
            editorStore.failPublish({
                kind: PUBLISH_ERROR_KIND.LOCK_LOST,
            } as never);
        });

        await lose();
        await settle(0);

        expect(control.restore).toHaveBeenCalledTimes(1);
        expect(editorStore.getState().publishFailure).toBeNull();
    });
});
