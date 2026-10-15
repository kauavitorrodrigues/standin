import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type GenericBodyProps = {
    onRetry: () => void;
};

export const GenericBody = ({ onRetry }: GenericBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>Não foi possível aplicar</AlertDialogTitle>
            <AlertDialogDescription>
                Algo deu errado ao aplicar a decoração. Ela continua salva e
                você pode tentar de novo.
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
