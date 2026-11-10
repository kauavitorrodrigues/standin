import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    // Its parts: an `AppDialogBody` and, when it needs one, an `AppDialogFooter`.
    children: ReactNode;
};

// A small dialog for one task of an app (connect, set up), opened from its
// details. The content scrolls when it is long.
export const AppActionDialog = ({
    open,
    onOpenChange,
    title,
    description,
    children,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            forceOverlay
            initialFocus={false}
            className="flex max-h-[min(42rem,calc(100%-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
            <DialogHeader className="border-b p-5 pr-12">
                <DialogTitle className="text-base">{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {children}
        </DialogContent>
    </Dialog>
);
