import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    isSaving: boolean;
    onSaveAndExit: () => void;
    onExitWithoutSaving: () => void;
    onKeepEditing: () => void;
};

// Leaving the composer with changes that were not saved.
export const AreaExitDialog = ({
    open,
    isSaving,
    onSaveAndExit,
    onExitWithoutSaving,
    onKeepEditing,
}: Props) => (
    <AlertDialog
        open={open}
        onOpenChange={(next) => {
            if (!next) onKeepEditing();
        }}
    >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Sair do compositor?</AlertDialogTitle>
                <AlertDialogDescription>
                    Você tem alterações que ainda não foram salvas.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:flex-wrap">
                <Button type="button" variant="outline" onClick={onKeepEditing}>
                    Continuar editando
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={onExitWithoutSaving}
                >
                    Sair sem salvar
                </Button>
                <Button
                    type="button"
                    disabled={isSaving}
                    onClick={onSaveAndExit}
                >
                    Salvar e sair
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
