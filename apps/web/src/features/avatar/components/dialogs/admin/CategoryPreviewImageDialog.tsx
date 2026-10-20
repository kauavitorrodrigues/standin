import type { AvatarCategory } from "@standin/contracts";
import { AVATAR_CATEGORY_MESSAGES } from "../../../consts/messages";
import { useReplaceAvatarCategoryPreview } from "../../../mutations/admin/categories/replacePreview";
import { ReplacePreviewDialog } from "./ReplacePreviewDialog";

type Props = {
    category: AvatarCategory;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const CategoryPreviewImageDialog = ({
    category,
    open,
    onOpenChange,
}: Props) => {
    const replacePreview = useReplaceAvatarCategoryPreview();

    return (
        <ReplacePreviewDialog
            title="Imagem da categoria"
            description={`A imagem que "${category.name}" mostra ao lado do nome, na lista do editor de avatar.`}
            replace={(image) =>
                replacePreview.mutateAsync({ slot: category.slot, image })
            }
            failedMessage={AVATAR_CATEGORY_MESSAGES.REPLACE_PREVIEW_FAILED}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
