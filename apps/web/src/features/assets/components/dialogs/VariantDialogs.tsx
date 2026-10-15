import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import type { VariantAction } from "../../types/variantActions";
import { ReplaceImageDialog } from "./ReplaceImageDialog";
import { DeleteDialog } from "./DeleteDialog";
import { UpdateColorDialog } from "./UpdateColorDialog";

type Props = {
    variant: LibraryFamilyVariant;
    family: Pick<LibraryFamilyDetail, "variants">;
    action: VariantAction;
    onOpenChange: (open: boolean) => void;
};

// The dialog the menu of a variation opened, if any.
export const VariantDialogs = ({
    variant,
    family,
    action,
    onOpenChange,
}: Props) => {
    switch (action) {
        case "color":
            return (
                <UpdateColorDialog
                    asset={variant}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "image":
            return (
                <ReplaceImageDialog
                    asset={variant}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "delete":
            return (
                <DeleteDialog
                    asset={variant}
                    family={family}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        default:
            return null;
    }
};
