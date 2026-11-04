import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ONBOARDING_MESSAGES } from "../../consts/messages";

type Props = {
    title: string;
    description: string;
    imageSrc?: string;
    guideUrl?: string;
    primaryLabel: string;
    onPrimary: () => void;
    onClose: () => void;
};

// One task: an image if there is one, the text, a link to the guide if there
// is one and a primary button.
export const TaskDialog = ({
    title,
    description,
    imageSrc,
    guideUrl,
    primaryLabel,
    onPrimary,
    onClose,
}: Props) => (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt=""
                    className="aspect-video w-full rounded-lg object-cover"
                />
            )}
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {guideUrl && (
                <a
                    href={guideUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-3 hover:text-foreground"
                >
                    {ONBOARDING_MESSAGES.GUIDE_LINK}
                    <ExternalLinkIcon className="size-3.5" />
                </a>
            )}
            <DialogFooter>
                <Button onClick={onPrimary}>{primaryLabel}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
