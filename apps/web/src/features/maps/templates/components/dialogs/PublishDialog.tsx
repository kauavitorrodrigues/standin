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
import { getPublishErrorMessage } from "../../utils/getPublishErrorMessage";

type Props = {
    template: Pick<MapTemplate, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Making a draft template available to the organizations.
export const PublishTemplateDialog = ({
    template,
    open,
    onOpenChange,
}: Props) => {
    const publish = TemplateMutations.publish();

    const confirm = async () => {
        try {
            await publish.mutateAsync(template.id);
            toast.add({ title: TEMPLATE_MESSAGES.PUBLISHED, type: "success" });
        } catch (error) {
            toast.add({ title: getPublishErrorMessage(error), type: "error" });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Publicar {template.name}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        O template fica disponível para as organizações criarem
                        espaços a partir dele.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={publish.isPending}
                        onClick={confirm}
                    >
                        Publicar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
