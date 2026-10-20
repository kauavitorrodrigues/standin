import type { AvatarBase } from "@standin/contracts";
import { AVATAR_BASE_MESSAGES } from "../../../consts/messages";
import { useRemoveAvatarBasePreview } from "../../../mutations/admin/bases/removePreview";
import { RemovePreviewDialog } from "./RemovePreviewDialog";

type Props = {
    base: AvatarBase;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const RemoveBasePreviewDialog = ({
    base,
    open,
    onOpenChange,
}: Props) => {
    const removePreview = useRemoveAvatarBasePreview();

    return (
        <RemovePreviewDialog
            description={`"${base.name}" volta a mostrar o primeiro quadro do sprite nas listas.`}
            remove={() => removePreview.mutateAsync(base.id)}
            isPending={removePreview.isPending}
            failedMessage={AVATAR_BASE_MESSAGES.REMOVE_PREVIEW_FAILED}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
