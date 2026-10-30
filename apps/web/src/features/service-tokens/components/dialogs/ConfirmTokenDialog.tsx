import type { ReactNode } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    cancelLabel: string;
    confirmLabel: string;
    confirmVariant?: ButtonProps["variant"];
    pending: boolean;
    onConfirm: () => void;
};

// The shell of the three confirmations of a token (revoke, regenerate,
// delete): only the words and the style of the button change.
export const ConfirmTokenDialog = ({
    open,
    onOpenChange,
    title,
    description,
    cancelLabel,
    confirmLabel,
    confirmVariant = "destructive",
    pending,
    onConfirm,
}: Props) => (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => onOpenChange(false)}
                >
                    {cancelLabel}
                </Button>
                <Button
                    type="button"
                    variant={confirmVariant}
                    disabled={pending}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
