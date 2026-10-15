import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import type { FamilyAction } from "../../types/familyActions";
import { EditDialog } from "./EditDialog";
import { DeleteDialog } from "./DeleteDialog";

type Props = {
    base: LibraryFamilyVariant;
    family: Pick<LibraryFamilyDetail, "variants">;
    action: FamilyAction;
    onOpenChange: (open: boolean) => void;
};

// The dialog the menu of an asset opened, if any.
export const FamilyDialogs = ({
    base,
    family,
    action,
    onOpenChange,
}: Props) => {
    switch (action) {
        case "edit":
            return <EditDialog asset={base} open onOpenChange={onOpenChange} />;
        case "delete":
            return (
                <DeleteDialog
                    asset={base}
                    family={family}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        default:
            return null;
    }
};
