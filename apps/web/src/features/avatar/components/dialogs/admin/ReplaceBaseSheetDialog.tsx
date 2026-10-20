import type { AvatarBase } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReplaceBaseSheetForm } from "../../forms/admin/ReplaceBaseSheetForm";

type Props = {
    base: AvatarBase;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ReplaceBaseSheetDialog = ({ base, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Trocar o sprite da base</DialogTitle>
                <DialogDescription>
                    Os avatares que usam "{base.name}" são refeitos com o novo
                    PNG.
                </DialogDescription>
            </DialogHeader>
            <ReplaceBaseSheetForm
                base={base}
                onDone={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
