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

type AvatarDiscardDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

// Asked when the editor is closed with changes that were not saved.
export const AvatarDiscardDialog = ({
    open,
    onOpenChange,
    onConfirm,
}: AvatarDiscardDialogProps) => (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                <AlertDialogDescription>
                    O avatar volta ao último estado salvo.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                <Button type="button" variant="destructive" onClick={onConfirm}>
                    Descartar
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
