import type { AvatarCategory } from "@standin/contracts";
import type { CategoryAction } from "../../../types/parts";
import { CategoryPreviewImageDialog } from "./CategoryPreviewImageDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { RemoveCategoryPreviewDialog } from "./RemoveCategoryPreviewDialog";

type Props = {
    category: AvatarCategory;
    action: CategoryAction;
    onOpenChange: (open: boolean) => void;
};

// The dialog the menu of a category opened, if any.
export const CategoryDialogs = ({ category, action, onOpenChange }: Props) => {
    switch (action) {
        case "edit":
            return (
                <EditCategoryDialog
                    category={category}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "replacePreview":
            return (
                <CategoryPreviewImageDialog
                    category={category}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "removePreview":
            return (
                <RemoveCategoryPreviewDialog
                    category={category}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        default:
            return null;
    }
};
