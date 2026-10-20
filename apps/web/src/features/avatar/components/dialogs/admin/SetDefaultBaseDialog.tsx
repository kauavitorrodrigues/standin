import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBase } from "@standin/contracts";
import { ConfirmDeleteDialog } from "@/features/assets/components/dialogs/ConfirmDeleteDialog";
import { AVATAR_BASE_MESSAGES } from "../../../consts/messages";
import { useConfirmPartAction } from "../../../hooks/admin/useConfirmPartAction";
import { useUpdateAvatarBase } from "../../../mutations/admin/bases/update";

type Props = {
    base: AvatarBase;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const SetDefaultBaseDialog = ({ base, open, onOpenChange }: Props) => {
    const updateBase = useUpdateAvatarBase();
    const { confirm } = useConfirmPartAction({
        perform: () =>
            updateBase.mutateAsync({
                baseId: base.id,
                changes: { isDefault: true },
            }),
        failedMessage: AVATAR_BASE_MESSAGES.SET_DEFAULT_FAILED,
        onDone: () => onOpenChange(false),
    });

    switch (base.kind) {
        case AVATAR_BASE_KINDS.BODY:
            return (
                <ConfirmDeleteDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    title="Tornar a base padrão?"
                    description={`"${base.name}" passa a ser o corpo de quem ainda não escolheu uma base. A base padrão de agora deixa de ser.`}
                    confirmLabel="Tornar padrão"
                    pending={updateBase.isPending}
                    onConfirm={confirm}
                />
            );
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return (
                <ConfirmDeleteDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    title="Usar este manequim na prévia?"
                    description={`"${base.name}" passa a ser o manequim das prévias das peças. As imagens de peças já criadas não mudam.`}
                    confirmLabel="Usar na prévia"
                    pending={updateBase.isPending}
                    onConfirm={confirm}
                />
            );
    }
};
