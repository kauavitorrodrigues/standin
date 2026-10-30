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
import { useDeleteClipConfirm } from "../../hooks/useDeleteClipConfirm";
import type { ClipDialogProps } from "../../types/dialog";

export const DeleteClipDialog = ({
    clip,
    open,
    onOpenChange,
}: ClipDialogProps) => {
    const remove = useDeleteClipConfirm(clip);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apagar {clip.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                        O clipe some para todos que usam esta biblioteca. Essa
                        ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        render={<Button variant="destructive" />}
                        disabled={remove.isPending}
                        onClick={remove.confirm}
                    >
                        Apagar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
