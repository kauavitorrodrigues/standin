import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DeskRemovalPrompt } from "@/features/maps/__shared__/types/DeskRemovalPrompt";

type DeskRemovalDialogProps = {
    prompt: DeskRemovalPrompt;
    onConfirm: () => void;
    onCancel: () => void;
};

const Ownership = ({ prompt }: { prompt: DeskRemovalPrompt }) => {
    if (prompt.plural) {
        return <>Estas mesas pertencem a {prompt.owners}.</>;
    }
    return <>Esta mesa pertence a {prompt.owners}.</>;
};

// Removing a desk that belongs to someone frees it. The dialog says whose it
// is, and that undo brings the desk back but not its owner.
export const DeskRemovalDialog = ({
    prompt,
    onConfirm,
    onCancel,
}: DeskRemovalDialogProps) => {
    const handleOpenChange = (open: boolean) => {
        if (!open) onCancel();
    };

    return (
        <AlertDialog open onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apagar mesa de alguém?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <Ownership prompt={prompt} /> Apagar libera a mesa.
                        Desfazer devolve a mesa, mas não o dono.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        Apagar
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
