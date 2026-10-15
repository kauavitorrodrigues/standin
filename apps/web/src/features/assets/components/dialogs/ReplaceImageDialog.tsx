import type { LibraryFamilyVariant } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReplaceImageForm } from "@/features/assets/components/forms/ReplaceImageForm";

type Props = {
    asset: LibraryFamilyVariant;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ReplaceImageDialog = ({ asset, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Trocar a imagem</DialogTitle>
                <DialogDescription>
                    Troca o PNG deste item. Só é possível enquanto nenhum mapa o
                    usa.
                </DialogDescription>
            </DialogHeader>
            <ReplaceImageForm
                asset={asset}
                onDone={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
