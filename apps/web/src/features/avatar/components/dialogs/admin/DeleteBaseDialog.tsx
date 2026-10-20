import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBase } from "@standin/contracts";
import { ConfirmDeleteDialog } from "@/features/assets/components/dialogs/ConfirmDeleteDialog";
import { AVATAR_BASE_MESSAGES } from "../../../consts/messages";
import { useConfirmPartAction } from "../../../hooks/admin/useConfirmPartAction";
import { useDeleteAvatarBase } from "../../../mutations/admin/bases/delete";

type Props = {
    base: AvatarBase;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const DeleteBaseDialog = ({ base, open, onOpenChange }: Props) => {
    const deleteMutation = useDeleteAvatarBase();
    const { confirm } = useConfirmPartAction({
        perform: () => deleteMutation.mutateAsync(base.id),
        failedMessage: AVATAR_BASE_MESSAGES.DELETE_FAILED,
        onDone: () => onOpenChange(false),
    });

    switch (base.kind) {
        case AVATAR_BASE_KINDS.BODY:
            return (
                <ConfirmDeleteDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    title="Excluir a base?"
                    description={`"${base.name}" sai do editor de avatar. Quem já usa a base continua com ela.`}
                    confirmLabel="Excluir"
                    pending={deleteMutation.isPending}
                    onConfirm={confirm}
                />
            );
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return (
                <ConfirmDeleteDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    title="Excluir o manequim?"
                    description={`"${base.name}" sai da lista de manequins. As imagens de peças já criadas com ele não mudam.`}
                    confirmLabel="Excluir"
                    pending={deleteMutation.isPending}
                    onConfirm={confirm}
                />
            );
    }
};
