import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type NetworkBodyProps = {
    onRetry: () => void;
};

// The server did not answer. The decoration stays saved on this computer, and
// it is tried again when the connection comes back or when asked.
export const NetworkBody = ({ onRetry }: NetworkBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>Sem conexão</AlertDialogTitle>
            <AlertDialogDescription>
                Não conseguimos falar com o servidor. Sua decoração continua
                salva e será aplicada quando a conexão voltar.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Continuar decorando</AlertDialogCancel>
            <Button type="button" onClick={onRetry}>
                Tentar de novo
            </Button>
        </AlertDialogFooter>
    </>
);
