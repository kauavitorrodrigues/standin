import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DESK_MESSAGES } from "../../consts/messages";

type MoveDeskDialogProps = {
    open: boolean;
    isBusy: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// Asks before the person leaves the desk they hold for another one.
export const MoveDeskDialog = ({
    open,
    isBusy,
    onConfirm,
    onCancel,
}: MoveDeskDialogProps) => (
    <AlertDialog
        open={open}
        onOpenChange={(next) => {
            if (!next) onCancel();
        }}
    >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{DESK_MESSAGES.MOVE_TITLE}</AlertDialogTitle>
                <AlertDialogDescription>
                    {DESK_MESSAGES.MOVE_DESCRIPTION}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    {DESK_MESSAGES.CANCEL}
                </Button>
                <Button type="button" disabled={isBusy} onClick={onConfirm}>
                    {DESK_MESSAGES.MOVE_CONFIRM}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
