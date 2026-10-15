import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { buildEditorModel, EDIT_SCOPES } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { mapPaletteQueryOptions } from "@/features/assets/queries/useMapPalette";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { DECORATOR_MESSAGES } from "@/features/decorator/consts/messages";
import { clearDraft } from "@/features/maps/__shared__/lib/draftDb";

// Brings the map as the server has it now and puts the operations of the
// draft back on it, as a replay. Resolves true when the draft was kept (with
// the same operations on the new base) and false when the map could not be
// fetched or an operation no longer holds, in which case the draft is dropped
// with a warning when the replay failed, and left alone when only the fetch
// failed.
export const useReplayDecoration = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const draftStore = useDraftStore();
    const editorStore = useEditorStore();

    return useCallback(async (): Promise<boolean> => {
        const { mapId } = draftStore.getState().base;
        const render = mapRenderQueryOptions(mapId);
        const palette = mapPaletteQueryOptions(mapId);

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: render.queryKey }),
            queryClient.invalidateQueries({ queryKey: palette.queryKey }),
        ]);
        const renderData = queryClient.getQueryData(render.queryKey);
        const paletteData = queryClient.getQueryData(palette.queryKey);
        if (!renderData || !paletteData) {
            toast.add({
                title: DECORATOR_MESSAGES.OPEN_FAILED,
                type: "error",
            });
            return false;
        }

        const ops = draftStore.getState().ops;
        draftStore.rebase(buildEditorModel(renderData, paletteData));
        const result = draftStore.restore(ops);
        editorStore.resetPublish();
        editorStore.closeDialog();
        if (result.ok) return true;

        toast.add({
            title: DECORATOR_MESSAGES.STALE_REPLAY_FAILED,
            description: result.errors[0]?.message,
            type: "error",
        });
        await clearDraft(user.id, mapId, EDIT_SCOPES.OBJECTS);
        return false;
    }, [draftStore, editorStore, queryClient, user.id]);
};
