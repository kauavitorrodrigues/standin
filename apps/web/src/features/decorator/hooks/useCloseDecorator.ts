import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";

// What the X of the panel does. Closing applies what was decorated, with no
// dialog on the happy path. With no changes nothing is sent, and with the lock
// lost nothing can be applied, so the decorator just closes (and the draft
// stays saved for a resume). Either way the game asks for the map again,
// because it ignored what the server sent while the decorator was open. While
// an apply is running the X waits.
export const useCloseDecorator = (
    apply: () => Promise<boolean>,
    onClose: () => void
) => {
    const queryClient = useQueryClient();
    const editorStore = useEditorStore();
    const draftStore = useDraftStore();

    return useCallback(() => {
        const state = editorStore.getState();
        if (state.publishPhase === PUBLISH_PHASE.PUBLISHING) return;

        if (state.locked || !state.draft.hasChanges) {
            const { mapId } = draftStore.getState().base;
            void queryClient.invalidateQueries({
                queryKey: mapRenderQueryOptions(mapId).queryKey,
            });
            onClose();
            return;
        }
        void apply();
    }, [apply, draftStore, editorStore, onClose, queryClient]);
};
