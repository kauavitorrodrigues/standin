import { SproutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProfileDecorate } from "../../types/profileDecorate";

const LABEL = "Decorar";

// The plant button of the profile card: it opens the decorator. When it cannot
// open now the button is off and the tooltip says why.
export const DecorateButton = ({
    onDecorate,
    disabledReason,
}: ProfileDecorate) => (
    <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
            <Button
                type="button"
                icon={SproutIcon}
                size="icon-lg"
                variant="secondary"
                aria-label={LABEL}
                disabled={disabledReason !== null}
                onClick={onDecorate}
            />
        </TooltipTrigger>
        <TooltipContent>{disabledReason ?? LABEL}</TooltipContent>
    </Tooltip>
);
