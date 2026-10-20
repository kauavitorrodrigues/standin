import type { AvatarPartRow } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditPartForm } from "../../forms/admin/EditPartForm";

type Props = {
    part: AvatarPartRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const EditPartDialog = ({ part, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar peça</DialogTitle>
                <DialogDescription>
                    O slot e as imagens não mudam aqui. O nome vale para todas
                    as cores da peça.
                </DialogDescription>
            </DialogHeader>
            <EditPartForm part={part} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
