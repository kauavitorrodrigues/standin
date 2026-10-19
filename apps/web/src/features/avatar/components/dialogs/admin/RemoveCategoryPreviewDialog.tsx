import type { AvatarCategory } from "@standin/contracts";
import { AVATAR_CATEGORY_MESSAGES } from "../../../consts/messages";
import { useRemoveAvatarCategoryPreview } from "../../../mutations/admin/categories/removePreview";
import { RemovePreviewDialog } from "./RemovePreviewDialog";

type Props = {
    category: AvatarCategory;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const RemoveCategoryPreviewDialog = ({
    category,
    open,
    onOpenChange,
}: Props) => {
    const removePreview = useRemoveAvatarCategoryPreview();

    return (
        <RemovePreviewDialog
            description={`"${category.name}" fica só com o nome na lista do editor de avatar.`}
            remove={() => removePreview.mutateAsync(category.slot)}
            isPending={removePreview.isPending}
            failedMessage={AVATAR_CATEGORY_MESSAGES.REMOVE_PREVIEW_FAILED}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
