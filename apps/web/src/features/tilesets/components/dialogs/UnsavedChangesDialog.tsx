import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    open: boolean;
    onStay: () => void;
    onLeave: () => void;
};

export const UnsavedChangesDialog = ({ open, onStay, onLeave }: Props) => {
    const handleOpenChange = (next: boolean) => {
        if (next) return;
        onStay();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sair sem salvar?</DialogTitle>
                    <DialogDescription>
                        Você marcou categorias que ainda não foram salvas. Se
                        sair agora, elas se perdem.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onStay}>
                        Continuar editando
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onLeave}
                    >
                        Sair sem salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
