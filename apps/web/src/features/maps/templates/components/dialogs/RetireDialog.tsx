import type { MapTemplate } from "@standin/contracts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { TEMPLATE_MESSAGES } from "../../consts/messages";
import { TemplateMutations } from "../../mutations";

type Props = {
    template: Pick<MapTemplate, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Taking a published template out of the list of the organizations.
export const RetireTemplateDialog = ({
    template,
    open,
    onOpenChange,
}: Props) => {
    const retire = TemplateMutations.retire();

    const confirm = async () => {
        try {
            await retire.mutateAsync(template.id);
            toast.add({ title: TEMPLATE_MESSAGES.RETIRED, type: "success" });
        } catch {
            toast.add({
                title: TEMPLATE_MESSAGES.RETIRE_FAILED,
                type: "error",
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Aposentar {template.name}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        O template deixa de aparecer para as organizações. Os
                        espaços já criados a partir dele não mudam.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={retire.isPending}
                        onClick={confirm}
                    >
                        Aposentar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
