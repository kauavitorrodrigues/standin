import type { AvatarPartRow } from "@standin/contracts";
import type { PartAction } from "../../../types/parts";
import { EditPartDialog } from "./EditPartDialog";
import { PartPreviewDialog } from "./PartPreviewDialog";
import { PartPreviewImageDialog } from "./PartPreviewImageDialog";
import { ReplaceSheetDialog } from "./ReplaceSheetDialog";
import { DeletePartDialog } from "./DeletePartDialog";

type Props = {
    part: AvatarPartRow;
    action: PartAction;
    onOpenChange: (open: boolean) => void;
};

// The dialog the menu of a row opened, if any.
export const PartDialogs = ({ part, action, onOpenChange }: Props) => {
    switch (action) {
        case "edit":
            return (
                <EditPartDialog part={part} open onOpenChange={onOpenChange} />
            );
        case "replaceFront":
            return (
                <ReplaceSheetDialog
                    part={part}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "replacePreview":
            return (
                <PartPreviewImageDialog
                    part={part}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "delete":
            return (
                <DeletePartDialog
                    part={part}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "preview":
            return (
                <PartPreviewDialog
                    part={part}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        default:
            return null;
    }
};
