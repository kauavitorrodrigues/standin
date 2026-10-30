import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ClipDialogProps } from "../../types/dialog";
import { EditClipForm } from "../forms/EditForm";

// Edits what a clip carries besides its sound: name, icon and volume.
export const EditClipDialog = ({
    clip,
    open,
    onOpenChange,
}: ClipDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar clipe</DialogTitle>
            </DialogHeader>
            <EditClipForm clip={clip} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
