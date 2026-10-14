import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import {
    pruneTileMeta,
    type LibraryTilesetDetail,
    type TileMeta,
} from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import { TILESET_MESSAGES } from "../consts/messages";
import { useReplaceTileMeta } from "../mutations/replaceMeta";
import type { TilesetEditorDialog, TilesetEditorValues } from "../types/editor";
import { isSameTileMeta } from "../utils/editor/metaEdit";
import { getTilesetSavedMessage } from "../utils/getSavedMessage";
import type { useTilesetGridForm } from "./useGridForm";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

// Everything the editor of a tileset does. The marks and the grid typed live
// in forms and only go to the server on save, which sends them together,
// leaving with unsaved changes asks first, and the dialogs (rename, delete)
// open over the page.
export const useTilesetEditor = (
    tileset: LibraryTilesetDetail,
    gridForm: ReturnType<typeof useTilesetGridForm>
) => {
    const { paths } = useLibraryScope();
    const navigate = useNavigate();
    const replaceTileMeta = useReplaceTileMeta();
    const saved = tileset.tileMeta ?? {};
    const [dialog, setDialog] = useState<TilesetEditorDialog>(null);

    const form = useForm<TilesetEditorValues>({
        defaultValues: { tileMeta: saved },
    });
    const meta = useWatch({ control: form.control, name: "tileMeta" });
    const metaDirty = !isSameTileMeta(meta, saved);
    const dirty = metaDirty || gridForm.changed;
    const guard = useUnsavedChangesGuard(dirty);

    const setMeta = (next: TileMeta) => {
        form.setValue("tileMeta", next, { shouldDirty: true });
    };

    const discard = () => {
        form.reset({ tileMeta: saved });
        gridForm.discard();
    };

    const showSaveError = (error: unknown, fallback: string) => {
        const apiError = getApiError(error);
        const lines = apiError.errors.map(({ message }) => message);
        if (lines.length === 0) lines.push(apiError.message ?? fallback);
        form.setError("root", { message: lines.join("\n") });
    };

    // Saves what changed, the grid first (the server keeps the marks that
    // still fit) and then the marks, cut to the new grid. If the grid is saved
    // and the marks fail, the grid stays saved and the marks stay unsaved.
    const save = async () => {
        form.clearErrors("root");
        const gridChanged = gridForm.changed;
        let nextMeta = meta;

        if (gridChanged) {
            if (!gridForm.draftGrid) return;
            const tileCount = gridForm.draftGrid.tileCount;
            try {
                const updated = await gridForm.apply();
                nextMeta = pruneTileMeta(meta, tileCount);
                if (!metaDirty) {
                    form.reset({ tileMeta: updated.tileMeta ?? {} });
                }
            } catch (error) {
                return showSaveError(error, TILESET_MESSAGES.GRID_SAVE_FAILED);
            }
        }

        if (metaDirty) {
            try {
                const updated = await replaceTileMeta.mutateAsync({
                    tilesetId: tileset.id,
                    tileMeta: nextMeta,
                });
                form.reset({ tileMeta: updated.tileMeta ?? {} });
            } catch (error) {
                return showSaveError(
                    error,
                    TILESET_MESSAGES.TILE_META_SAVE_FAILED
                );
            }
        }

        toast.add({
            title: getTilesetSavedMessage(gridChanged, metaDirty),
            type: "success",
        });
    };

    // A dialog closing is the only way it asks to change.
    const changeDialogOpen = (open: boolean) => {
        if (open) return;
        setDialog(null);
    };

    const handleDeleted = () => {
        guard.release();
        navigate({ to: paths.tilesets });
    };

    return {
        meta,
        setMeta,
        dirty,
        isSaving: replaceTileMeta.isPending || gridForm.isSaving,
        issuesMessage: form.formState.errors.root?.message,
        dialog,
        setDialog,
        changeDialogOpen,
        discard,
        save,
        handleDeleted,
        guard,
    };
};
