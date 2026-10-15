import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ResumeDialogProps = {
    // A decoration the owner paused by opening the Studio over it.
    paused: boolean;
    // The objects of the space changed since it was saved.
    changed: boolean;
    onResume: () => void;
    onDiscard: () => void;
};

const ResumeDescription = ({
    paused,
    changed,
}: Pick<ResumeDialogProps, "paused" | "changed">) => {
    if (changed) {
        return (
            <AlertDialogDescription>
                O space mudou desde que você salvou esta decoração. Podemos
                tentar refazê-la sobre a versão nova, e o que não couber mais
                será descartado.
            </AlertDialogDescription>
        );
    }
    if (paused) {
        return (
            <AlertDialogDescription>
                O dono abriu a edição do space e sua decoração ficou guardada.
                Deseja continuar de onde parou?
            </AlertDialogDescription>
        );
    }
    return (
        <AlertDialogDescription>
            Você tem uma decoração que ainda não foi aplicada. Deseja continuar
            de onde parou?
        </AlertDialogDescription>
    );
};

// Offered when the decorator opens and finds a saved decoration. It closes
// only by choosing, so the decoration is never lost by a stray click.
export const ResumeDialog = ({
    paused,
    changed,
    onResume,
    onDiscard,
}: ResumeDialogProps) => (
    <AlertDialog open>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Retomar decoração</AlertDialogTitle>
                <ResumeDescription paused={paused} changed={changed} />
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button type="button" variant="outline" onClick={onDiscard}>
                    Descartar
                </Button>
                <Button type="button" onClick={onResume}>
                    Retomar decoração
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
