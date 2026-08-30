import type { MapEntity } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormDialogControls } from "@/components/FormDialogControls";
import { toast } from "@/components/ui/toast";
import { MapMutations } from "../../mutations";
import { MapsQueries } from "../../queries";
import { DeleteMessages } from "../forms/Messages";

type Props = {
    map: MapEntity;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const DeleteMapDialog = ({ map, open, onOpenChange }: Props) => {
    const deleteMutation = MapMutations.delete();
    const mapsQueryUtils = MapsQueries.useByOrganizationUtils();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(map.id);
            toast.add({ title: DeleteMessages.success, type: "success" });
            mapsQueryUtils.invalidate();
            onOpenChange(false);
        } catch {
            toast.add({ title: DeleteMessages.error, type: "error" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir mapa</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir o mapa{" "}
                        <strong>{map.name}</strong>? Essa ação não pode ser
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
