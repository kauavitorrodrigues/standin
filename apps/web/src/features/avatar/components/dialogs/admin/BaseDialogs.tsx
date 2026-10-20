import type { AvatarBase } from "@standin/contracts";
import type { BaseAction } from "../../../types/parts";
import { BasePreviewImageDialog } from "./BasePreviewImageDialog";
import { EditBaseDialog } from "./EditBaseDialog";
import { RemoveBasePreviewDialog } from "./RemoveBasePreviewDialog";
import { ReplaceBaseSheetDialog } from "./ReplaceBaseSheetDialog";
import { DeleteBaseDialog } from "./DeleteBaseDialog";
import { SetDefaultBaseDialog } from "./SetDefaultBaseDialog";

type Props = {
    base: AvatarBase;
    action: BaseAction;
    onOpenChange: (open: boolean) => void;
};

// The dialog the menu of a base opened, if any.
export const BaseDialogs = ({ base, action, onOpenChange }: Props) => {
    switch (action) {
        case "edit":
            return (
                <EditBaseDialog base={base} open onOpenChange={onOpenChange} />
            );
        case "setDefault":
            return (
                <SetDefaultBaseDialog
                    base={base}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "replaceImage":
            return (
                <ReplaceBaseSheetDialog
                    base={base}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "replacePreview":
            return (
                <BasePreviewImageDialog
                    base={base}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "removePreview":
            return (
                <RemoveBasePreviewDialog
                    base={base}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "delete":
            return (
                <DeleteBaseDialog
                    base={base}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        default:
            return null;
    }
};
