import type { LibraryTilesetSummary } from "@standin/contracts";
import { ConfirmDeleteDialog } from "@/features/assets/components/dialogs/ConfirmDeleteDialog";
import { useDeleteTilesetDialog } from "../../hooks/useDeleteDialog";

type Props = {
    tileset: Pick<LibraryTilesetSummary, "id" | "name" | "inUse">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Called once it is gone, so a page that shows it can leave.
    onDeleted?: () => void;
};

// What the dialog says the delete does. A tileset that maps paint with leaves
// the library, and those maps keep rendering it.
const getDescription = (inUse: boolean): string => {
    if (inUse) {
        return "Este tileset será apagado de vez. Os mapas que pintam com ele continuam funcionando. Essa ação não pode ser desfeita.";
    }
    return "Este tileset será apagado de vez. Essa ação não pode ser desfeita.";
};

// Deleting a tileset for good.
export const DeleteTilesetDialog = ({
    tileset,
    open,
    onOpenChange,
    onDeleted,
}: Props) => {
    const { pending, confirm } = useDeleteTilesetDialog({
        tileset,
        onOpenChange,
        onDeleted,
    });

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Apagar ${tileset.name}`}
            description={getDescription(tileset.inUse)}
            confirmLabel="Apagar"
            pending={pending}
            onConfirm={confirm}
        />
    );
};
