import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { PublishResult } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { mapPaletteQueryOptions } from "@/features/assets/queries/useMapPalette";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { PUBLISH_ERROR_KIND } from "@/features/maps/__shared__/consts/publish";
import { EDITOR_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { useDraftStore } from "@/features/maps/__shared__/hooks/useDraftStore";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { clearDraft } from "@/features/maps/__shared__/lib/draftDb";
import { EditorMutations } from "@/features/maps/__shared__/mutations";
import type { PublishAttempt } from "@/features/maps/__shared__/types/publish-attempt";
import { getPublishAttempt } from "@/features/maps/__shared__/utils/getPublishAttempt";
import { runPublish } from "@/features/maps/__shared__/utils/runPublish";

type UsePublishDraftOptions = {
    // Called after a publish that worked, with the answer of the server.
    onPublished?: (result: PublishResult) => void;
    // Leaves the editor. Called when the publish was asked to leave.
    onLeave: () => void;
};

// Publishes the draft: builds the request (the same one again when nothing
// changed since the last try), runs it and reacts to how it ended. The lock
// lost is the one failure with no dialog: it only warns, and the badge shows
// it.
export const usePublishDraft = ({
    onPublished,
    onLeave,
}: UsePublishDraftOptions) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const draftStore = useDraftStore();
    const editorStore = useEditorStore();
    const { mutateAsync } = EditorMutations.publish();
    const attemptRef = useRef<PublishAttempt | null>(null);

    return useCallback(async () => {
        const state = draftStore.getState();
        const { mapId } = state.base;
        const attempt = getPublishAttempt(attemptRef.current, state, () =>
            crypto.randomUUID()
        );
        attemptRef.current = attempt;

        const outcome = await runPublish(
            {
                editorStore,
                draftStore,
                publish: mutateAsync,
                clearSavedDraft: async () => {
                    await clearDraft(user.id, mapId);
                },
            },
            { attempt }
        );

        if (!outcome.ok) {
            if (outcome.failure.kind === PUBLISH_ERROR_KIND.LOCK_LOST) {
                editorStore.hidePublish();
                toast.add({ title: EDITOR_MESSAGES.LOCK_LOST, type: "error" });
            }
            return;
        }

        attemptRef.current = null;
        toast.add({ title: EDITOR_MESSAGES.PUBLISHED, type: "success" });
        void queryClient.invalidateQueries({
            queryKey: mapRenderQueryOptions(mapId).queryKey,
        });
        void queryClient.invalidateQueries({
            queryKey: mapPaletteQueryOptions(mapId).queryKey,
        });
        onPublished?.(outcome.result);

        const leaves = editorStore.getState().exitAfterPublish;
        editorStore.dismissPublish();
        if (leaves) onLeave();
    }, [
        draftStore,
        editorStore,
        mutateAsync,
        onLeave,
        onPublished,
        queryClient,
        user.id,
    ]);
};
