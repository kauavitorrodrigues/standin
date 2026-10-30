import { Volume2Icon } from "lucide-react";
import type { SoundboardClip } from "@standin/contracts";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SOUNDBOARD_TOOLTIP_DELAY_MS } from "../../../consts/tooltip";
import { TileIconButton } from "./TileIconButton";
import { PreviewTooltip } from "./PreviewTooltip";

type Props = {
    clip: Pick<SoundboardClip, "name" | "icon">;
    // Whether this clip is the one being previewed, for the screens that show
    // it on the button. Left out, the button never looks pressed.
    isPreviewing?: boolean;
    onPreview: () => void;
    // Where it sits in the overlay when it needs more than the start.
    className?: string;
};

// Listens to the clip on your own speakers, and sends nothing to the call.
export const ClipPreviewButton = ({
    clip,
    isPreviewing,
    onPreview,
    className,
}: Props) => (
    <Tooltip>
        <TooltipTrigger
            delay={SOUNDBOARD_TOOLTIP_DELAY_MS}
            render={
                <span
                    className={cn(
                        "pointer-events-auto flex items-center",
                        className
                    )}
                />
            }
        >
            <TileIconButton
                label={`Prévia de ${clip.name}`}
                pressed={isPreviewing}
                onClick={onPreview}
            >
                <Volume2Icon />
            </TileIconButton>
        </TooltipTrigger>
        <PreviewTooltip clip={clip} />
    </Tooltip>
);
