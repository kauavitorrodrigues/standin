import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description: ReactNode;
    confirmLabel: string;
    pending: boolean;
    onConfirm: () => void;
};

// The confirmation of deleting something for good.
export const ConfirmDeleteDialog = ({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    pending,
    onConfirm,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => onOpenChange(false)}
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
