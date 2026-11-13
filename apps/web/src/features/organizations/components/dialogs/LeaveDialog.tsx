import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { memberErrorMessage } from "../../utils/memberErrorMessage";
import { OrganizationMutations } from "../../mutations";

type Props = {
    organizationId: string;
    organizationName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Asks before a member leaves the organization.
export const LeaveOrganizationDialog = ({
    organizationId,
    organizationName,
    open,
    onOpenChange,
}: Props) => {
    const leave = OrganizationMutations.leave(organizationId);

    const confirm = () =>
        leave.mutate(undefined, {
            // The toast and the move to another organization come from the
            // socket notice, which may unmount this dialog before this runs.
            onSuccess: () => onOpenChange(false),
            onError: (error) =>
                toast.add({
                    title: memberErrorMessage(
                        error,
                        "Não foi possível sair da organização."
                    ),
                    type: "error",
                }),
        });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sair da organização?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você perde o acesso a {organizationName}, seus espaços e
                        sua mesa. Suas mensagens continuam lá. Para voltar, só
                        com um novo convite.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={leave.isPending}
                        onClick={confirm}
                    >
                        Sair
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
