import { InfoIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// The info icon next to a title. The tooltip is the app's own, rendered in a
// portal above the dialog: the native `title` of the browser can stay hidden
// behind a modal dialog.
export const InfoHint = ({ text }: { text: string }) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <span
                    tabIndex={0}
                    aria-label={text}
                    className="inline-flex rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
            }
        >
            <InfoIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent className="font-normal">{text}</TooltipContent>
    </Tooltip>
);
