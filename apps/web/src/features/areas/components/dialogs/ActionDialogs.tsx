import type { AreaSummary } from "@standin/contracts";
import type { AreaAction } from "../../types/actions";
import { DeleteAreaDialog } from "./DeleteDialog";
import { RenameAreaDialog } from "./RenameDialog";

type Props = {
    area: AreaSummary;
    action: AreaAction;
    onOpenChange: (open: boolean) => void;
};

// The dialog the menu of a card opened, if any.
export const AreaActionDialogs = ({ area, action, onOpenChange }: Props) => {
    switch (action) {
        case "rename":
            return (
                <RenameAreaDialog
                    area={area}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "delete":
            return (
                <DeleteAreaDialog
                    area={area}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        default:
            return null;
    }
};
