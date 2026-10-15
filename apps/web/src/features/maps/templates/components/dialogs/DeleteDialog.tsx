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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { TEMPLATE_MESSAGES } from "../../consts/messages";
import { TemplateMutations } from "../../mutations";
import { getDeleteErrorMessage } from "../../utils/getDeleteErrorMessage";
import { UnpublishedChangesWarning } from "../views/card/UnpublishedChangesWarning";

type Props = {
    template: Pick<MapTemplate, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Runs after the template is gone, e.g. to leave the editor of its map.
    onDeleted?: () => void;
    // Warns that the draft of the editor goes with the template.
    hasUnpublishedChanges?: boolean;
    // Wraps the delete when it needs something done around it (the editor
    // gives the lock back first). Without it the delete runs as it is.
    run?: (action: () => Promise<void>) => Promise<void>;
};

// Deleting a template for good, with its map and thumbnail.
export const DeleteTemplateDialog = ({
    template,
    open,
    onOpenChange,
    onDeleted,
    hasUnpublishedChanges = false,
    run = (action) => action(),
}: Props) => {
    const deleteTemplate = TemplateMutations.delete();

    const confirm = async () => {
        try {
            await run(() => deleteTemplate.mutateAsync(template.id));
            toast.add({ title: TEMPLATE_MESSAGES.DELETED, type: "success" });
            onDeleted?.();
        } catch (error) {
            toast.add({ title: getDeleteErrorMessage(error), type: "error" });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apagar {template.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apagar o mapa e a miniatura. Essa ação não pode ser
                        desfeita.
                        <UnpublishedChangesWarning
                            visible={hasUnpublishedChanges}
                        />
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        render={<Button variant="destructive" />}
                        onClick={confirm}
                    >
                        Apagar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
