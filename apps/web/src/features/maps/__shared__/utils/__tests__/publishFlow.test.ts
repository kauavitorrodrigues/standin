import { describe, expect, it, vi } from "vitest";
import type {
    EditorModel,
    EditorOp,
    LibraryPalette,
    MapLayout,
    PublishResult,
} from "@standin/contracts";
import {
    PUBLISH_DIALOG_MODE,
    PUBLISH_ERROR_KIND,
} from "@/features/maps/__shared__/consts/publish";
import { PUBLISH_PHASE } from "@/features/maps/__shared__/consts/publish-phase";
import { createDraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import { createEditorStore } from "@/features/maps/__shared__/lib/EditorStore";
import type { PublishInput } from "@/features/maps/__shared__/types/publish-input";
import { buildPublishedModel } from "@/features/maps/__shared__/utils/buildPublishedModel";
import { getPublishAttempt } from "@/features/maps/__shared__/utils/getPublishAttempt";
import { getPublishDialogMode } from "@/features/maps/__shared__/utils/getPublishDialogMode";
import { PublishError } from "@/features/maps/__shared__/utils/PublishError";
import { runPublish } from "@/features/maps/__shared__/utils/runPublish";

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

const RESULT: PublishResult = {
    version: 4,
    idMap: {},
    limits: { objectsUsed: 0, objectsMax: 12 },
};

const setup = () => {
    const editorStore = createEditorStore();
    const draftStore = createDraftStore(
        buildBase(),
        editorStore.setDraftSummary
    );
    draftStore.dispatchGesture([background("#111111")]);
    const clearSavedDraft = vi.fn(async () => {});
    return { editorStore, draftStore, clearSavedDraft };
};

const attemptOf = (draftStore: ReturnType<typeof createDraftStore>) =>
    getPublishAttempt(null, draftStore.getState(), () => "id-1");

describe("buildPublishedModel", () => {
    it("swaps the temporary ids, the version and the limit", () => {
        const draft: EditorModel = {
            ...buildBase(),
            placed: [
                {
                    id: "temp-a",
                    assetId: "x",
                    tileX: 0,
                    tileY: 0,
                    parentId: null,
                    propertyOverrides: null,
                },
                {
                    id: "temp-b",
                    assetId: "x",
                    tileX: 1,
                    tileY: 0,
                    parentId: "temp-a",
                    propertyOverrides: null,
                },
                {
                    id: "kept",
                    assetId: "x",
                    tileX: 2,
                    tileY: 0,
                    parentId: null,
                    propertyOverrides: null,
                },
            ],
        };

        const model = buildPublishedModel(draft, {
            ...RESULT,
            idMap: { "temp-a": "real-a", "temp-b": "real-b" },
        });

        expect(model.placed.map(({ id }) => id)).toEqual([
            "real-a",
            "real-b",
            "kept",
        ]);
        expect(model.placed[1].parentId).toBe("real-a");
        expect(model.version).toBe(4);
        expect(model.limits).toEqual(RESULT.limits);
    });
});

describe("getPublishAttempt", () => {
    it("keeps the publishId while nothing changed and renews it after a change", () => {
        const { draftStore } = setup();
        const first = getPublishAttempt(
            null,
            draftStore.getState(),
            () => "id-1"
        );
        const again = getPublishAttempt(
            first,
            draftStore.getState(),
            () => "id-2"
        );
        expect(again.publishId).toBe("id-1");

        draftStore.dispatchGesture([background("#222222")]);
        const changed = getPublishAttempt(
            first,
            draftStore.getState(),
            () => "id-3"
        );
        expect(changed.publishId).toBe("id-3");
        expect(changed.ops).toHaveLength(2);
        expect(changed.baseVersion).toBe(3);
    });
});

describe("getPublishDialogMode", () => {
    it("follows the phase and the kind of failure", () => {
        expect(getPublishDialogMode(PUBLISH_PHASE.IDLE, null)).toBe(
            PUBLISH_DIALOG_MODE.CONFIRM
        );
        expect(getPublishDialogMode(PUBLISH_PHASE.PUBLISHING, null)).toBe(
            PUBLISH_DIALOG_MODE.PUBLISHING
        );
        expect(
            getPublishDialogMode(PUBLISH_PHASE.ERROR, {
                kind: PUBLISH_ERROR_KIND.VALIDATION,
                issues: [],
            })
        ).toBe(PUBLISH_DIALOG_MODE.VALIDATION);
        expect(
            getPublishDialogMode(PUBLISH_PHASE.ERROR, {
                kind: PUBLISH_ERROR_KIND.STALE,
            })
        ).toBe(PUBLISH_DIALOG_MODE.STALE);
        expect(
            getPublishDialogMode(PUBLISH_PHASE.ERROR, {
                kind: PUBLISH_ERROR_KIND.RETRYABLE,
            })
        ).toBe(PUBLISH_DIALOG_MODE.FAILED);
    });
});

describe("runPublish", () => {
    it("on success sends the request, swaps the base and clears the saved draft", async () => {
        const { editorStore, draftStore, clearSavedDraft } = setup();
        const publish = vi.fn<(input: PublishInput) => Promise<PublishResult>>(
            async () => RESULT
        );
        const attempt = attemptOf(draftStore);

        const outcome = await runPublish(
            { editorStore, draftStore, publish, clearSavedDraft },
            { attempt }
        );

        expect(outcome.ok).toBe(true);
        expect(publish).toHaveBeenCalledWith({
            mapId: "map-1",
            sessionId: editorStore.sessionId,
            publishId: "id-1",
            baseVersion: 3,
            ops: attempt.ops,
        });
        const state = draftStore.getState();
        expect(state.base.version).toBe(4);
        expect(state.ops).toEqual([]);
        expect(state.draft.layout.backgroundcolor).toBe("#111111");
        expect(clearSavedDraft).toHaveBeenCalledTimes(1);
        expect(editorStore.getState().publishPhase).toBe(
            PUBLISH_PHASE.PUBLISHED
        );
        expect(editorStore.getState().draft.hasChanges).toBe(false);
    });

    it("on 422 keeps the draft and the failure with the errors", async () => {
        const { editorStore, draftStore, clearSavedDraft } = setup();
        const issues = [{ opIndex: 0, code: "X", path: "p", message: "m" }];
        const publish = vi.fn(async () => {
            throw new PublishError({
                kind: PUBLISH_ERROR_KIND.VALIDATION,
                issues,
            });
        });

        const outcome = await runPublish(
            { editorStore, draftStore, publish, clearSavedDraft },
            { attempt: attemptOf(draftStore) }
        );

        expect(outcome.ok).toBe(false);
        expect(draftStore.getState().ops).toHaveLength(1);
        expect(draftStore.getState().base.version).toBe(3);
        expect(clearSavedDraft).not.toHaveBeenCalled();
        expect(editorStore.getState()).toMatchObject({
            publishPhase: PUBLISH_PHASE.ERROR,
            publishFailure: { kind: PUBLISH_ERROR_KIND.VALIDATION, issues },
        });
    });

    it("on 409 offers the stale failure and keeps the base", async () => {
        const { editorStore, draftStore, clearSavedDraft } = setup();
        const publish = vi.fn(async () => {
            throw new PublishError({ kind: PUBLISH_ERROR_KIND.STALE });
        });

        await runPublish(
            { editorStore, draftStore, publish, clearSavedDraft },
            { attempt: attemptOf(draftStore) }
        );

        const { publishPhase, publishFailure } = editorStore.getState();
        expect(getPublishDialogMode(publishPhase, publishFailure)).toBe(
            PUBLISH_DIALOG_MODE.STALE
        );
        expect(draftStore.getState().ops).toHaveLength(1);
    });

    it("on 423 the failure is the lost lock", async () => {
        const { editorStore, draftStore, clearSavedDraft } = setup();
        const publish = vi.fn(async () => {
            throw new PublishError({ kind: PUBLISH_ERROR_KIND.LOCK_LOST });
        });

        await runPublish(
            { editorStore, draftStore, publish, clearSavedDraft },
            { attempt: attemptOf(draftStore) }
        );

        expect(editorStore.getState().publishFailure).toEqual({
            kind: PUBLISH_ERROR_KIND.LOCK_LOST,
        });
    });

    it("a repeat after a failure sends the same publishId", async () => {
        const { editorStore, draftStore, clearSavedDraft } = setup();
        let calls = 0;
        const publish = vi.fn<(input: PublishInput) => Promise<PublishResult>>(
            async () => {
                calls += 1;
                if (calls === 1) {
                    throw new PublishError({
                        kind: PUBLISH_ERROR_KIND.RETRYABLE,
                    });
                }
                return RESULT;
            }
        );
        let ids = 0;
        const createId = () => `id-${++ids}`;
        const deps = { editorStore, draftStore, publish, clearSavedDraft };

        const first = getPublishAttempt(null, draftStore.getState(), createId);
        await runPublish(deps, { attempt: first });
        expect(editorStore.getState().publishPhase).toBe(PUBLISH_PHASE.ERROR);

        const second = getPublishAttempt(
            first,
            draftStore.getState(),
            createId
        );
        const outcome = await runPublish(deps, { attempt: second });

        expect(outcome.ok).toBe(true);
        expect(publish.mock.calls.map(([input]) => input.publishId)).toEqual([
            "id-1",
            "id-1",
        ]);
    });
});
