import { ConfirmDeleteDialog } from "@/features/assets/components/dialogs/ConfirmDeleteDialog";
import { useConfirmPartAction } from "../../../hooks/admin/useConfirmPartAction";

type Props = {
    description: string;
    remove: () => Promise<unknown>;
    isPending: boolean;
    failedMessage: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// The confirmation of taking a preview image away. The list falls back to the
// first frame of the sheet, or to no image for a category.
export const RemovePreviewDialog = ({
    description,
    remove,
    isPending,
    failedMessage,
    open,
    onOpenChange,
}: Props) => {
    const { confirm } = useConfirmPartAction({
        perform: remove,
        failedMessage,
        onDone: () => onOpenChange(false),
    });

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Remover a imagem?"
            description={description}
            confirmLabel="Remover"
            pending={isPending}
            onConfirm={confirm}
        />
    );
};
