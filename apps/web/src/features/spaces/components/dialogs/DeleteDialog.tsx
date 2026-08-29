import type { Space } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormDialogControls } from "@/components/FormDialogControls";
import { toast } from "@/components/ui/toast";
import { SpaceMutations } from "../../mutations";
import { SpacesQueries } from "../../queries";
import { DeleteMessages } from "../forms/Messages";

type Props = {
    space: Space;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const DeleteSpaceDialog = ({ space, open, onOpenChange }: Props) => {
    const deleteMutation = SpaceMutations.delete();
    const spacesQueryUtils = SpacesQueries.useByOrganizationUtils();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(space.id);
            toast.add({ title: DeleteMessages.success, type: "success" });
            spacesQueryUtils.invalidate();
            onOpenChange(false);
        } catch {
            toast.add({ title: DeleteMessages.error, type: "error" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir espaço</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir o espaço{" "}
                        <strong>{space.name}</strong>? Essa ação não pode ser
                        desfeita.
                    </DialogDescription>
                </DialogHeader>
                <FormDialogControls
                    onSubmit={handleDelete}
                    onClose={() => onOpenChange(false)}
                    submitLabel="Excluir"
                    submitVariant="destructive"
                    isSubmitting={deleteMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
};
