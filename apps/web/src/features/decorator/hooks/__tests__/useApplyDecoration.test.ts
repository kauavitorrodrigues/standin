// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublishResult } from "@standin/contracts";
import { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { DraftStoreContext } from "@/features/editor/contexts/DraftStoreContext";
import { EditorStoreContext } from "@/features/editor/contexts/EditorStoreContext";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";
import { useApplyDecoration } from "@/features/decorator/hooks/useApplyDecoration";
import { EditorLockContext } from "@/features/maps/__shared__/contexts/EditorLockContext";
import type { EditorLockControl } from "@/features/maps/__shared__/types/EditorLockControl";
import { PublishError } from "@/features/maps/__shared__/utils/PublishError";
import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";

const mocks = vi.hoisted(() => ({
    mutateAsync: vi.fn(),
    clearDraft: vi.fn(async () => ({ ok: true, value: undefined })),
    toastAdd: vi.fn(),
}));

vi.mock("@/lib/axios/api", () => ({ api: {} }));
vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "" }));
vi.mock("@/features/desks/queries/useSpaceDesks", () => ({
    SPACE_DESKS_QUERY_KEY: "spaceDesks",
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: mocks.toastAdd } }));
vi.mock("@/features/auth/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "user-1" } }),
}));
vi.mock("@/features/maps/__shared__/mutations", () => ({
    EditorMutations: { publish: () => ({ mutateAsync: mocks.mutateAsync }) },
}));
vi.mock("@/features/maps/__shared__/lib/draftDb", () => ({
    clearDraft: mocks.clearDraft,
}));

const RESULT: PublishResult = {
    version: 3,
    objectsRevision: "r2",
    idMap: {},
    limits: { objectsUsed: 0, objectsMax: 100 },
};

let root: Root;
let apply: () => Promise<boolean>;
const onApplied = vi.fn();
const control = {
    reacquire: vi.fn(),
    restore: vi.fn(),
    markLost: vi.fn(),
    release: vi.fn(),
};

const setup = () => {
    const editorStore = createEditorStore();
    const draftStore = createDraftStore(
        {
            ...buildModel([placedAt("crate-1", "crate", 0, 0)]),
            objectsRevision: "r1",
        },
        editorStore.setDraftSummary
    );
    draftStore.dispatchGesture([{ type: "remove_asset", id: "crate-1" }]);

    const Probe = () => {
        apply = useApplyDecoration(onApplied);
        return null;
    };
    act(() => {
        root.render(
            createElement(
                QueryClientProvider,
                { client: new QueryClient() },
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
            )
        );
    });
    return { editorStore, draftStore };
};

const run = async () => {
    let result = false;
    await act(async () => {
        result = await apply();
    });
    return result;
};

const rejectWith = (failure: ClassifiedPublishError) =>
    mocks.mutateAsync.mockRejectedValueOnce(new PublishError(failure));

describe("useApplyDecoration", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        mocks.mutateAsync.mockReset();
        mocks.clearDraft.mockClear();
        mocks.toastAdd.mockClear();
        onApplied.mockClear();
        control.markLost.mockClear();
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("applies the objects scope, clears the saved draft and closes", async () => {
        mocks.mutateAsync.mockResolvedValueOnce(RESULT);
        const { editorStore, draftStore } = setup();

        expect(await run()).toBe(true);

        expect(mocks.mutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "objects",
                baseObjectsRevision: "r1",
                mapId: "map-1",
            })
        );
        expect(mocks.clearDraft).toHaveBeenCalledWith(
            "user-1",
            "map-1",
            "objects"
        );
        expect(draftStore.getState().base.objectsRevision).toBe("r2");
        expect(editorStore.getState().publishPhase).toBe(
            PUBLISH_PHASE.PUBLISHED
        );
        expect(onApplied).toHaveBeenCalledTimes(1);
    });

    it.each([
        [
            "422 keeps the decorator open with what failed",
            { kind: PUBLISH_ERROR_KIND.VALIDATION, issues: [] },
        ],
        [
            "409 STALE_OBJECTS offers a replay or a discard",
            { kind: PUBLISH_ERROR_KIND.STALE },
        ],
        [
            "no network keeps the draft and offers a retry",
            { kind: PUBLISH_ERROR_KIND.RETRYABLE },
        ],
        [
            "an unknown failure keeps the draft",
            { kind: PUBLISH_ERROR_KIND.UNKNOWN },
        ],
    ] as [string, ClassifiedPublishError][])("%s", async (_name, failure) => {
        rejectWith(failure);
        const { editorStore, draftStore } = setup();

        expect(await run()).toBe(false);

        const state = editorStore.getState();
        expect(state.publishPhase).toBe(PUBLISH_PHASE.ERROR);
        expect(state.publishFailure).toEqual(failure);
        expect(state.dialog).toBe(EDITOR_DIALOG.PUBLISH);
        expect(draftStore.getState().ops).toHaveLength(1);
        expect(mocks.clearDraft).not.toHaveBeenCalled();
        expect(onApplied).not.toHaveBeenCalled();
    });

    it("marks the lock as lost with no dialog on a 423", async () => {
        rejectWith({ kind: PUBLISH_ERROR_KIND.LOCK_LOST });
        const { editorStore } = setup();

        expect(await run()).toBe(false);

        expect(control.markLost).toHaveBeenCalledTimes(1);
        expect(editorStore.getState().dialog).toBeNull();
        expect(onApplied).not.toHaveBeenCalled();
    });

    it("retries with the same request after a lost connection", async () => {
        rejectWith({ kind: PUBLISH_ERROR_KIND.RETRYABLE });
        mocks.mutateAsync.mockResolvedValueOnce(RESULT);
        setup();

        await run();
        expect(await run()).toBe(true);

        const [first, second] = mocks.mutateAsync.mock.calls.map(
            ([input]) => input.publishId
        );
        expect(first).toBe(second);
    });
});
