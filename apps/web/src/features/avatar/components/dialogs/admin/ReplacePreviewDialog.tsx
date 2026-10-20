import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReplacePreviewForm } from "../../forms/admin/ReplacePreviewForm";

type Props = {
    title: string;
    description: string;
    replace: (image: File) => Promise<unknown>;
    failedMessage: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// The dialog that adds or swaps a preview image. What it belongs to is up to
// the caller, which passes the function that sends it.
export const ReplacePreviewDialog = ({
    title,
    description,
    replace,
    failedMessage,
    open,
    onOpenChange,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <ReplacePreviewForm
                replace={replace}
                failedMessage={failedMessage}
                onDone={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
