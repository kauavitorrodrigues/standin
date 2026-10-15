import type { LibraryFamilyVariant } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UpdateColorForm } from "@/features/assets/components/forms/UpdateColorForm";

type Props = {
    asset: LibraryFamilyVariant;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const UpdateColorDialog = ({ asset, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar cor</DialogTitle>
                <DialogDescription>
                    Muda o nome e o tom desta cor em todas as rotações. Vale
                    mesmo que algum mapa já use este item.
                </DialogDescription>
            </DialogHeader>
            <UpdateColorForm asset={asset} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
