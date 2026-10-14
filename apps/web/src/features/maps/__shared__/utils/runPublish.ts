import { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";
import type {
    RunPublishDeps,
    RunPublishParams,
    RunPublishResult,
} from "@/features/maps/__shared__/types/run-publish";
import { PublishError } from "@/features/maps/__shared__/utils/PublishError";
import { buildPublishedModel } from "@/features/maps/__shared__/utils/buildPublishedModel";

// Sends one attempt and moves the stores with the answer. A success swaps the
// base of the draft for the published model and removes the saved copy. A
// failure leaves the draft as it was and puts the failure on the store, where
// the dialog and the badge read it.
export const runPublish = async (
    { editorStore, draftStore, publish, clearSavedDraft }: RunPublishDeps,
    { attempt }: RunPublishParams
): Promise<RunPublishResult> => {
    const { mapId } = draftStore.getState().base;
    editorStore.beginPublish();

    try {
        const result = await publish({
            mapId,
            sessionId: editorStore.sessionId,
            publishId: attempt.publishId,
            baseVersion: attempt.baseVersion,
            ops: attempt.ops,
        });

        draftStore.rebase(
            buildPublishedModel(draftStore.getState().draft, result)
        );
        await clearSavedDraft();
        editorStore.finishPublish();
        return { ok: true, result };
    } catch (error) {
        const failure =
            error instanceof PublishError
                ? error.failure
                : { kind: PUBLISH_ERROR_KIND.UNKNOWN };
        editorStore.failPublish(failure);
        return { ok: false, failure };
    }
};
