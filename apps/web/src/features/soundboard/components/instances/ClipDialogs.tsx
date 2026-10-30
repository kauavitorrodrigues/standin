import type {
    ClipDialogKind,
    ClipDialogMap,
    ClipDialogProps,
} from "../../types/dialog";
import { DeleteClipDialog } from "../dialogs/DeleteDialog";
import { EditClipDialog } from "../dialogs/EditDialog";

type Props = {
    clip: ClipDialogProps["clip"];
    kind: ClipDialogKind | null;
    onClose: () => void;
};

const DIALOGS: ClipDialogMap = {
    edit: EditClipDialog,
    delete: DeleteClipDialog,
};

// The dialog of a clip that is open, if any. It mounts on opening, so each
// one starts from the clip as it is.
export const ClipDialogs = ({ clip, kind, onClose }: Props) => {
    if (kind === null) return null;
    const Dialog = DIALOGS[kind];

    return (
        <Dialog
            clip={clip}
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        />
    );
};
