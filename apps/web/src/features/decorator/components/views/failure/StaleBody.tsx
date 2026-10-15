import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type StaleBodyProps = {
    isReplaying: boolean;
    onReplay: () => void;
    onDiscard: () => void;
};

// The objects of the space changed while the decorator was open. The
// decoration can be replayed on the new state, or thrown away.
export const StaleBody = ({
    isReplaying,
    onReplay,
    onDiscard,
}: StaleBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>
                O space mudou enquanto você decorava
            </AlertDialogTitle>
            <AlertDialogDescription>
                Podemos tentar refazer a sua decoração sobre a versão nova.
                Alguma alteração pode não caber mais e, nesse caso, ela será
                descartada.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <Button type="button" variant="destructive" onClick={onDiscard}>
                Descartar
            </Button>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <Button type="button" isLoading={isReplaying} onClick={onReplay}>
                Retomar com a versão nova
            </Button>
        </AlertDialogFooter>
    </>
);
