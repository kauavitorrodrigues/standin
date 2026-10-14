import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { buildEditorModel } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { mapPaletteQueryOptions } from "@/features/assets/queries/useMapPalette";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { EDITOR_MESSAGES } from "@/features/editor/consts/messages";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { clearDraft } from "@/features/maps/__shared__/lib/draftDb";

// Throws the draft away and brings the map as the server has it now: the
// render and the palette are fetched again, the base of the draft becomes the
// new model and the saved copy is removed. The draft stays as it was when the
// map cannot be fetched.
export const useReloadMap = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const draftStore = useDraftStore();
    const editorStore = useEditorStore();

    return useCallback(async () => {
        const { mapId } = draftStore.getState().base;
        const render = mapRenderQueryOptions(mapId);
        const palette = mapPaletteQueryOptions(mapId);

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: render.queryKey }),
            queryClient.invalidateQueries({ queryKey: palette.queryKey }),
        ]);

        const renderData = queryClient.getQueryData(render.queryKey);
        const paletteData = queryClient.getQueryData(palette.queryKey);
        const failed =
            queryClient.getQueryState(render.queryKey)?.status === "error" ||
            queryClient.getQueryState(palette.queryKey)?.status === "error";

        if (failed || !renderData || !paletteData) {
            toast.add({
                title: EDITOR_MESSAGES.RELOAD_FAILED,
                type: "error",
            });
            return;
        }

        draftStore.rebase(buildEditorModel(renderData, paletteData));
        await clearDraft(user.id, mapId);
        editorStore.resetPublish();
        editorStore.closeDialog();
    }, [draftStore, editorStore, queryClient, user.id]);
};
