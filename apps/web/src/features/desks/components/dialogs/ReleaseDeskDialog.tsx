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

type ReleaseDeskDialogProps = {
    // The name of the person whose desk is freed, or null with the dialog
    // closed.
    ownerName: string | null;
    isBusy: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// Asks before the owner of the organization frees the desk of someone else.
export const ReleaseDeskDialog = ({
    ownerName,
    isBusy,
    onConfirm,
    onCancel,
}: ReleaseDeskDialogProps) => (
    <AlertDialog
        open={ownerName !== null}
        onOpenChange={(next) => {
            if (!next) onCancel();
        }}
    >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {DESK_MESSAGES.releaseTitle(ownerName ?? "")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {DESK_MESSAGES.RELEASE_DESCRIPTION}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    {DESK_MESSAGES.CANCEL}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    disabled={isBusy}
                    onClick={onConfirm}
                >
                    {DESK_MESSAGES.RELEASE_CONFIRM}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
