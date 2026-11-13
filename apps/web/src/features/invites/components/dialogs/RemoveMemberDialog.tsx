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
    // The name of the person to remove, or null with the dialog closed.
    memberName: string | null;
    isBusy: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// Asks before the owner removes someone from the organization.
export const RemoveMemberDialog = ({
    memberName,
    isBusy,
    onConfirm,
    onCancel,
}: Props) => (
    <AlertDialog
        open={memberName !== null}
        onOpenChange={(next) => {
            if (!next) onCancel();
        }}
    >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Remover {memberName}?</AlertDialogTitle>
                <AlertDialogDescription>
                    A pessoa perde o acesso a todos os espaços da organização
                    agora, a mesa fica livre e as conexões com serviços externos
                    são apagadas. As mensagens ficam. Ela só volta com um novo
                    convite.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    disabled={isBusy}
                    onClick={onConfirm}
                >
                    Remover
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
