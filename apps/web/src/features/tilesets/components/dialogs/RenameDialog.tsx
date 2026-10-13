import type { LibraryTilesetSummary } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RenameTilesetForm } from "../forms/RenameForm";

type Props = {
    tileset: Pick<LibraryTilesetSummary, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const RenameTilesetDialog = ({ tileset, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Renomear o tileset</DialogTitle>
                <DialogDescription>
                    O nome aparece na biblioteca. A chave e a imagem não mudam.
                </DialogDescription>
            </DialogHeader>
            <RenameTilesetForm
                tileset={tileset}
                onDone={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
