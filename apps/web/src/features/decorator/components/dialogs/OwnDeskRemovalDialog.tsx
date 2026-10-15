import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type OwnDeskRemovalDialogProps = {
    // What goes with the desk, already in words. Null when nothing is on it.
    items: string | null;
    onConfirm: () => void;
    onCancel: () => void;
};

const ItemsNotice = ({ items }: { items: string | null }) => {
    if (items === null) return null;

    return <> {items}</>;
};

// Removing the own desk frees it, and what is on it goes along. The dialog
// says so before anything is removed. Undo works until the decorator closes,
// and after that the desk stays gone, because the claim is the server's.
export const OwnDeskRemovalDialog = ({
    items,
    onConfirm,
    onCancel,
}: OwnDeskRemovalDialogProps) => {
    const handleOpenChange = (open: boolean) => {
        if (!open) onCancel();
    };

    return (
        <AlertDialog open onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apagar a sua mesa?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você fica sem mesa até pegar outra.
                        <ItemsNotice items={items} /> Dá para desfazer até
                        fechar o decorator.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        Apagar a mesa
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
