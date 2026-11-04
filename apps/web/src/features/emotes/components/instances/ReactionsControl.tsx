import { SmileIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactionsButtonState } from "@/features/emotes/types/reactions";
import { SentEmoteBadge } from "@/features/emotes/components/views/SentEmoteBadge";

type Props = ReactionsButtonState;

// The button of the control bar that opens and closes the reactions bar.
export const ReactionsControl = ({ isOpen, onToggle, sentEmoji }: Props) => {
    return (
        <span className="relative">
            <SentEmoteBadge emoji={sentEmoji} />
            <Tooltip>
                <TooltipTrigger
                    render={
                        <ControlButton
                            type="button"
                            aria-label="Reações"
                            aria-pressed={isOpen}
                            className="aria-pressed:bg-foreground/15"
                            onClick={onToggle}
                        />
                    }
                >
                    <SmileIcon />
                </TooltipTrigger>
                <TooltipContent>Reações</TooltipContent>
            </Tooltip>
        </span>
    );
};
