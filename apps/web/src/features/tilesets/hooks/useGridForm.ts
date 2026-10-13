import { useForm, useWatch } from "react-hook-form";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { useReplaceTilesetGrid } from "../mutations/replaceGrid";
import type { TilesetGridFormValues } from "../types/gridForm";
import { getTilesetGrid } from "../utils/grid/getGrid";

// The margin and the spacing of a tileset that exists. What is typed is
// previewed on the sheet (`draftGrid`, null when the image does not divide
// that way) and kept as a draft until the editor saves, which calls `apply`.
export const useTilesetGridForm = (tileset: LibraryTilesetDetail) => {
    const replaceGrid = useReplaceTilesetGrid();
    const saved = { margin: tileset.margin, spacing: tileset.spacing };
    const form = useForm<TilesetGridFormValues>({ defaultValues: saved });
    const [margin, spacing] = useWatch({
        control: form.control,
        name: ["margin", "spacing"],
    });

    const draftGrid = getTilesetGrid(
        { w: tileset.widthPx, h: tileset.heightPx },
        margin ?? 0,
        spacing ?? 0
    );
    const changed =
        (margin ?? 0) !== saved.margin || (spacing ?? 0) !== saved.spacing;

    const discard = () => form.reset(saved);

    // Sends the typed grid. The server keeps the marks that still fit, and
    // answers with the tileset as it is left. It throws when it fails.
    const apply = async (): Promise<LibraryTilesetDetail> => {
        const updated = await replaceGrid.mutateAsync({
            tilesetId: tileset.id,
            margin: margin ?? 0,
            spacing: spacing ?? 0,
        });
        form.reset({ margin: updated.margin, spacing: updated.spacing });
        return updated;
    };

    return {
        form,
        draftGrid,
        changed,
        isSaving: replaceGrid.isPending,
        discard,
        apply,
    };
};
