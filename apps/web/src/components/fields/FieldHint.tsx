import { InfoIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = { children: string };

// The "?" beside a label that explains the field on hover or focus.
export const FieldHint = ({ children }: Props) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <button
                    type="button"
                    aria-label="O que é este campo"
                    className="text-muted-foreground hover:text-foreground inline-flex"
                />
            }
        >
            <InfoIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-72 text-pretty">
            {children}
        </TooltipContent>
    </Tooltip>
);
