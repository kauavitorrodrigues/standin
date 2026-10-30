import { AudioLinesIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SOUNDBOARD_SHORTCUT } from "../../consts/shortcuts";

type Props = {
    isOpen: boolean;
    isPlaying: boolean;
    onToggle: () => void;
};

const LABEL = "Soundboard";

// The control bar button that opens and closes the row of clips.
export const SoundboardButton = ({ isOpen, isPlaying, onToggle }: Props) => {
    const className = cn(
        "aria-pressed:bg-foreground/15",
        isPlaying && "text-primary"
    );

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <ControlButton
                        type="button"
                        aria-label={LABEL}
                        aria-pressed={isOpen}
                        className={className}
                        onClick={onToggle}
                    />
                }
            >
                <AudioLinesIcon />
            </TooltipTrigger>
            <TooltipContent shortcut={SOUNDBOARD_SHORTCUT.label}>
                {LABEL}
            </TooltipContent>
        </Tooltip>
    );
};
