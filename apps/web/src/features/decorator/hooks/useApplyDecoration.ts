import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EDIT_SCOPES } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { mapPaletteQueryOptions } from "@/features/assets/queries/useMapPalette";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { SPACE_DESKS_QUERY_KEY } from "@/features/desks/queries/useSpaceDesks";
import { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";
import { DECORATOR_MESSAGES } from "@/features/decorator/consts/messages";
import { useLockControl } from "@/features/maps/__shared__/hooks/useLockControl";
import { clearDraft } from "@/features/maps/__shared__/lib/draftDb";
import { EditorMutations } from "@/features/maps/__shared__/mutations";
import type { PublishAttempt } from "@/features/maps/__shared__/types/publish-attempt";
import { getPublishAttempt } from "@/features/maps/__shared__/utils/getPublishAttempt";
import { runPublish } from "@/features/maps/__shared__/utils/runPublish";

const releasedADesk = (attempt: PublishAttempt): boolean =>
    attempt.ops.some(
        (op) => op.type === "remove_asset" && op.releaseDesk === true
    );

// Applies the decoration: builds the request (the same one again when nothing
// changed since the last try), runs it and reacts to how it ended. A success
// warns, refreshes the map (and the desks, when the own desk went away, so the
// person is without one even if the event of the room is missed) and calls
// `onApplied`. A failure keeps the draft:
// the lock lost only warns (the notice over the panel speaks for it), and any
// other failure opens the dialog of the store with what failed. Resolves true
// when the decoration was applied.
export const useApplyDecoration = (onApplied: () => void) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const draftStore = useDraftStore();
    const editorStore = useEditorStore();
    const lockControl = useLockControl();
    const { mutateAsync } = EditorMutations.publish();
    const attemptRef = useRef<PublishAttempt | null>(null);

    const fail = useCallback(
        (failure: ClassifiedPublishError) => {
            if (failure.kind === PUBLISH_ERROR_KIND.LOCK_LOST) {
                editorStore.hidePublish();
                lockControl.markLost();
                toast.add({
                    title: DECORATOR_MESSAGES.LOCK_LOST,
                    type: "error",
                });
                return;
            }
            editorStore.reopenPublish();
        },
        [editorStore, lockControl]
    );

    return useCallback(async (): Promise<boolean> => {
        const state = draftStore.getState();
        const { mapId } = state.base;
        const attempt = getPublishAttempt(
            attemptRef.current,
            state,
            () => crypto.randomUUID(),
            EDIT_SCOPES.OBJECTS
        );
        attemptRef.current = attempt;

        const outcome = await runPublish(
            {
                editorStore,
                draftStore,
                publish: mutateAsync,
                clearSavedDraft: async () => {
                    await clearDraft(user.id, mapId, EDIT_SCOPES.OBJECTS);
                },
            },
            { attempt }
        );

        if (!outcome.ok) {
            fail(outcome.failure);
            return false;
        }

        attemptRef.current = null;
        void queryClient.invalidateQueries({
            queryKey: mapRenderQueryOptions(mapId).queryKey,
        });
        void queryClient.invalidateQueries({
            queryKey: mapPaletteQueryOptions(mapId).queryKey,
        });
        if (releasedADesk(attempt)) {
            void queryClient.invalidateQueries({
                queryKey: [SPACE_DESKS_QUERY_KEY],
            });
        }
        editorStore.dismissPublish();
        onApplied();
        return true;
    }, [
        draftStore,
        editorStore,
        fail,
        mutateAsync,
        onApplied,
        queryClient,
        user.id,
    ]);
};
