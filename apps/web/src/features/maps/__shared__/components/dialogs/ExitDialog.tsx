import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ExitDialogProps = {
    open: boolean;
    // Without the lock the draft cannot be published.
    publishDisabled?: boolean;
    onPublishAndExit: () => void;
    onKeepAndExit: () => void;
    onDiscardAndExit: () => void;
    onKeepEditing: () => void;
};

// Leaving with changes that were not published.
export const ExitDialog = ({
    open,
    publishDisabled = false,
    onPublishAndExit,
    onKeepAndExit,
    onDiscardAndExit,
    onKeepEditing,
}: ExitDialogProps) => {
    const handleOpenChange = (next: boolean) => {
        if (next) return;
        onKeepEditing();
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sair do editor?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você tem alterações que ainda não foram publicadas.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onKeepEditing}
                    >
                        Continuar editando
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onDiscardAndExit}
                    >
                        Descartar e sair
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onKeepAndExit}
                    >
                        Sair e manter o rascunho
                    </Button>
                    <Button
                        type="button"
                        disabled={publishDisabled}
                        onClick={onPublishAndExit}
                    >
                        Publicar e sair
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
