import type { LibraryFamilyVariant } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditForm } from "@/features/assets/components/forms/EditForm";

type Props = {
    asset: LibraryFamilyVariant;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const EditDialog = ({ asset, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Editar item</DialogTitle>
                <DialogDescription>
                    Os campos valem para todas as variações. O que vem da
                    imagem, como o tamanho e a pegada, não muda aqui.
                </DialogDescription>
            </DialogHeader>
            <EditForm asset={asset} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
