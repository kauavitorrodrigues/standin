import type { LibraryFamilySummary } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AddVariantDialogBody } from "./AddVariantDialogBody";

type Props = {
    family: LibraryFamilySummary;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// The form marks itself with `data-wide` when it shows the editor, and the
// dialog opens up to hold it beside the fields.
export const AddVariantDialog = ({ family, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto transition-[max-width] duration-200 sm:max-w-xl sm:has-data-[wide]:max-w-[min(80rem,calc(100vw-4rem))]">
            <DialogHeader>
                <DialogTitle>Adicionar variação</DialogTitle>
                <DialogDescription>
                    Uma nova cor ou rotação deste item, cada uma com o seu PNG.
                </DialogDescription>
            </DialogHeader>
            <AddVariantDialogBody
                family={family}
                onDone={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
