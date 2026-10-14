import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type PublishFailedBodyProps = {
    onRetry: () => void;
};

// The server did not answer after the repeats. Trying again sends the same
// request.
export const PublishFailedBody = ({ onRetry }: PublishFailedBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>Erro ao publicar</AlertDialogTitle>
            <AlertDialogDescription>
                Não conseguimos falar com o servidor. Seu rascunho foi mantido.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <Button type="button" onClick={onRetry}>
                Tentar de novo
            </Button>
        </AlertDialogFooter>
    </>
);
