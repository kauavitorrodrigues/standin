import type { AreaSummary } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RenameAreaForm } from "../forms/RenameForm";

type Props = {
    area: Pick<AreaSummary, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const RenameAreaDialog = ({ area, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Renomear a área</DialogTitle>
                <DialogDescription>
                    O nome aparece na lista de áreas e na paleta do editor de
                    mapas.
                </DialogDescription>
            </DialogHeader>
            <RenameAreaForm area={area} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
