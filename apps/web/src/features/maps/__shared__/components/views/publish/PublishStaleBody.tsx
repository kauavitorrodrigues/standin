import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type PublishStaleBodyProps = {
    onReload: () => void;
};

// The map was published by someone else while this draft was open.
export const PublishStaleBody = ({ onReload }: PublishStaleBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>
                O mapa mudou desde que você abriu
            </AlertDialogTitle>
            <AlertDialogDescription>
                As suas alterações não podem ser aplicadas sobre a versão nova.
                Descarte o rascunho para recarregar o mapa.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={onReload}>
                Descartar e recarregar
            </Button>
        </AlertDialogFooter>
    </>
);
