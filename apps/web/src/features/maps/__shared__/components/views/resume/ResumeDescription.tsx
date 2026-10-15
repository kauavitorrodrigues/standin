import { AlertDialogDescription } from "@/components/ui/alert-dialog";

type ResumeDescriptionProps = {
    stale: boolean;
};

export const ResumeDescription = ({ stale }: ResumeDescriptionProps) => {
    if (stale) {
        return (
            <AlertDialogDescription>
                O mapa mudou desde que você salvou este rascunho, então ele não
                pode ser retomado. Descarte o rascunho para continuar editando.
            </AlertDialogDescription>
        );
    }

    return (
        <AlertDialogDescription>
            Você tem alterações salvas neste mapa que não foram publicadas.
            Deseja continuar de onde parou?
        </AlertDialogDescription>
    );
};
