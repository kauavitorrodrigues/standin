import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EDITOR_DIALOG } from "@/features/maps/__shared__/consts/editor-dialog";
import {
    PUBLISHED_BADGE_MS,
    PUBLISH_ERROR_KIND,
} from "@/features/maps/__shared__/consts/publish";
import { PUBLISH_PHASE } from "@/features/maps/__shared__/consts/publish-phase";
import { createEditorStore } from "@/features/maps/__shared__/lib/EditorStore";

const withChanges = () => {
    const store = createEditorStore();
    store.setDraftSummary({
        hasChanges: true,
        canUndo: true,
        canRedo: false,
    });
    return store;
};

describe("EditorStore publish", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("has one session id per store", () => {
        const a = createEditorStore();
        const b = createEditorStore();
        expect(a.sessionId).toBeTruthy();
        expect(a.sessionId).toBe(a.sessionId);
        expect(a.sessionId).not.toBe(b.sessionId);
    });

    it("opens the dialog only when there is something to publish", () => {
        const empty = createEditorStore();
        empty.requestPublish();
        expect(empty.getState().dialog).toBeNull();

        const store = withChanges();
        store.requestPublish();
        expect(store.getState().dialog).toBe(EDITOR_DIALOG.PUBLISH);
    });

    it("publishAndExit opens the dialog and asks to leave", () => {
        const store = withChanges();
        store.publishAndExit();
        expect(store.getState()).toMatchObject({
            dialog: EDITOR_DIALOG.PUBLISH,
            exitAfterPublish: true,
        });
    });

    it("goes idle, publishing, published and back to idle", () => {
        const store = createEditorStore();
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.IDLE);

        store.beginPublish();
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.PUBLISHING);

        store.finishPublish();
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.PUBLISHED);

        vi.advanceTimersByTime(PUBLISHED_BADGE_MS);
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.IDLE);
    });

    it("does not undo a newer phase when the published badge times out", () => {
        const store = createEditorStore();
        store.finishPublish();
        store.beginPublish();
        vi.advanceTimersByTime(PUBLISHED_BADGE_MS);
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.PUBLISHING);
    });

    it("keeps the failure on error and drops it on a new request", () => {
        const store = withChanges();
        store.beginPublish();
        store.failPublish({ kind: PUBLISH_ERROR_KIND.RETRYABLE });
        expect(store.getState()).toMatchObject({
            publishPhase: PUBLISH_PHASE.ERROR,
            publishFailure: { kind: PUBLISH_ERROR_KIND.RETRYABLE },
        });

        store.requestPublish();
        expect(store.getState()).toMatchObject({
            publishPhase: PUBLISH_PHASE.IDLE,
            publishFailure: null,
        });
    });

    it("dismissing drops a failure that needs a change and keeps the others", () => {
        const store = withChanges();
        store.publishAndExit();
        store.failPublish({ kind: PUBLISH_ERROR_KIND.STALE });
        store.dismissPublish();
        expect(store.getState()).toMatchObject({
            dialog: null,
            exitAfterPublish: false,
            publishPhase: PUBLISH_PHASE.IDLE,
            publishFailure: null,
        });

        store.failPublish({ kind: PUBLISH_ERROR_KIND.RETRYABLE });
        store.dismissPublish();
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.ERROR);

        store.reopenPublish();
        expect(store.getState().dialog).toBe(EDITOR_DIALOG.PUBLISH);
    });

    it("hiding keeps the failure", () => {
        const store = withChanges();
        store.requestPublish();
        store.failPublish({ kind: PUBLISH_ERROR_KIND.VALIDATION, issues: [] });
        store.hidePublish();
        expect(store.getState().dialog).toBeNull();
        expect(store.getState().publishPhase).toBe(PUBLISH_PHASE.ERROR);
    });
});
