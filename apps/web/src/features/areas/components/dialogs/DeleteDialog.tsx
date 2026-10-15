import type { AreaSummary } from "@standin/contracts";
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
import { getApiError } from "@/features/assets/utils/getApiError";
import { AREA_MESSAGES } from "../../consts/messages";
import { AreasMutations } from "../../mutations";

type Props = {
    area: Pick<AreaSummary, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Deleting an area. The maps that already placed it keep their copy.
export const DeleteAreaDialog = ({ area, open, onOpenChange }: Props) => {
    const remove = AreasMutations.remove();

    const confirm = async () => {
        try {
            await remove.mutateAsync(area.id);
            toast.add({ title: AREA_MESSAGES.DELETED, type: "success" });
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ?? AREA_MESSAGES.DELETE_FAILED,
                type: "error",
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apagar {area.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                        A área sai da lista e da paleta do editor de mapas. Os
                        mapas que já a usam continuam como estão. Essa ação não
                        pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        render={<Button variant="destructive" />}
                        disabled={remove.isPending}
                        onClick={confirm}
                    >
                        Apagar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
