import { SmileIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactionsButtonState } from "@/features/emotes/types/reactions";
import { SentEmoteBadge } from "@/features/emotes/components/views/SentEmoteBadge";

type Props = ReactionsButtonState & {
    // Emotes only mean something on the office, where there are avatars to see
    // them. Over the chat the button is not rendered.
    visible: boolean;
};

// The button of the control bar that opens and closes the reactions bar.
export const ReactionsControl = ({
    visible,
    isOpen,
    onToggle,
    sentEmoji,
}: Props) => {
    if (!visible) return null;

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
