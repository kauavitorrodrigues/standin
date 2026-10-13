import type { ReactNode } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = { text: string; children: ReactNode };

// Explains what a control does on hover. The trigger is a wrapper, so a
// disabled button still shows its tooltip.
export const HintTooltip = ({ text, children }: Props) => (
    <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
            {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-pretty">{text}</TooltipContent>
    </Tooltip>
);
