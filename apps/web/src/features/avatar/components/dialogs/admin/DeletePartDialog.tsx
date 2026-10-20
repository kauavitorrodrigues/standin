import type { AvatarPartRow } from "@standin/contracts";
import { ConfirmDeleteDialog } from "@/features/assets/components/dialogs/ConfirmDeleteDialog";
import { AVATAR_PART_MESSAGES } from "../../../consts/messages";
import { useConfirmPartAction } from "../../../hooks/admin/useConfirmPartAction";
import { useDeleteAvatarPart } from "../../../mutations/admin/delete";

type Props = {
    part: AvatarPartRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const DeletePartDialog = ({ part, open, onOpenChange }: Props) => {
    const deleteMutation = useDeleteAvatarPart();
    const { confirm } = useConfirmPartAction({
        perform: () => deleteMutation.mutateAsync(part.id),
        failedMessage: AVATAR_PART_MESSAGES.DELETE_FAILED,
        onDone: () => onOpenChange(false),
    });

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Excluir a peça?"
            description={`"${part.name}" sai do editor de avatar. Quem já usa a peça continua com ela.`}
            confirmLabel="Excluir"
            pending={deleteMutation.isPending}
            onConfirm={confirm}
        />
    );
};
