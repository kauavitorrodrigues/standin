import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { AppStatus } from "../../types/app";
import { AppDialogBody } from "../views/dialog/Body";
import { AppDialogFooter } from "../views/dialog/Footer";
import { AppIcon } from "../views/card/AppIcon";
import { AppStatusBadge } from "../views/card/StatusBadge";
import { AppTags } from "../views/card/AppTags";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    icon: ReactNode;
    name: string;
    provider: string;
    status: AppStatus;
    description: string;
    tags: string[];
    // The information of the app: what it is and how it works.
    children: ReactNode;
    // The buttons at the bottom: connect, set up.
    actions: ReactNode;
};

// What an app is, in a small dialog: who it is on top, the information that
// scrolls in the middle and the actions at the bottom.
export const AppDialog = ({
    open,
    onOpenChange,
    icon,
    name,
    provider,
    status,
    description,
    tags,
    children,
    actions,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            forceOverlay
            initialFocus={false}
            className="flex max-h-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
            <DialogHeader className="gap-3 border-b p-5">
                <div className="flex items-center gap-3">
                    <AppIcon>{icon}</AppIcon>
                    <div className="flex flex-col">
                        <DialogTitle className="text-base">{name}</DialogTitle>
                        <span className="text-xs text-muted-foreground">
                            Por {provider}
                        </span>
                    </div>
                </div>
                <DialogDescription>{description}</DialogDescription>
                <div className="flex flex-wrap items-center gap-2">
                    <AppStatusBadge status={status} />
                    <AppTags tags={tags} />
                </div>
            </DialogHeader>
            <AppDialogBody>{children}</AppDialogBody>
            <AppDialogFooter>{actions}</AppDialogFooter>
        </DialogContent>
    </Dialog>
);
