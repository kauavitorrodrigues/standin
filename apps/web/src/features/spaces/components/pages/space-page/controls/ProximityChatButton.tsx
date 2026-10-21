import { MessageCircleIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    NEARBY_CHAT_HOTKEY,
    NEARBY_CHAT_TEXTS,
} from "@/features/nearby-chat/consts/nearby-chat";
import type { NearbyChatButtonState } from "@/features/nearby-chat/types/nearby-chat";

type Props = NearbyChatButtonState;

// The button of the control bar that opens and closes the nearby chat panel.
export const ProximityChatButton = ({ isOpen, onToggle }: Props) => {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <ControlButton
                        type="button"
                        aria-label={NEARBY_CHAT_TEXTS.TITLE}
                        aria-pressed={isOpen}
                        className="aria-pressed:bg-foreground/15"
                        onClick={onToggle}
                    />
                }
            >
                <MessageCircleIcon />
            </TooltipTrigger>
            <TooltipContent shortcut={NEARBY_CHAT_HOTKEY}>
                {NEARBY_CHAT_TEXTS.TITLE}
            </TooltipContent>
        </Tooltip>
    );
};
