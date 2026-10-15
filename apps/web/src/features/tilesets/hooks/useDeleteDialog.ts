import type { LibraryTilesetSummary } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import { TILESET_MESSAGES } from "../consts/messages";
import { useDeleteTileset } from "../mutations/delete";

type Params = {
    tileset: Pick<LibraryTilesetSummary, "id">;
    onOpenChange: (open: boolean) => void;
    // Called once it is gone, so a page that shows it can leave.
    onDeleted?: () => void;
};

// Deletes the tileset and tells how it went.
export const useDeleteTilesetDialog = ({
    tileset,
    onOpenChange,
    onDeleted,
}: Params) => {
    const deleteTileset = useDeleteTileset();

    const confirm = async () => {
        try {
            await deleteTileset.mutateAsync(tileset.id);
            toast.add({ title: TILESET_MESSAGES.DELETED, type: "success" });
            onOpenChange(false);
            onDeleted?.();
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ??
                    TILESET_MESSAGES.DELETE_FAILED,
                type: "error",
            });
        }
    };

    return { pending: deleteTileset.isPending, confirm };
};
