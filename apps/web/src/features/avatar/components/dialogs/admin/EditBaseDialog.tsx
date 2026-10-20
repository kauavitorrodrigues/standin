import type { AvatarBase } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditBaseForm } from "../../forms/admin/EditBaseForm";

type Props = {
    base: AvatarBase;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const EditBaseDialog = ({ base, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar base</DialogTitle>
                <DialogDescription>
                    Os PNGs têm as próprias ações no menu da base.
                </DialogDescription>
            </DialogHeader>
            <EditBaseForm base={base} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
