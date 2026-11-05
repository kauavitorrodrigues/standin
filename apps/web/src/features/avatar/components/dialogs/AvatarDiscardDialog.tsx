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
    onSave: () => void;
};

// Asked when the editor is closed with changes that were not saved.
export const AvatarDiscardDialog = ({
    open,
    onOpenChange,
    onConfirm,
    onSave,
}: AvatarDiscardDialogProps) => (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="border border-border">
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
                <Button type="button" onClick={onSave}>
                    Salvar
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
