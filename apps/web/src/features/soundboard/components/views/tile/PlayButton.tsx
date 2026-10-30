import { PlayIcon } from "lucide-react";
import type { SoundboardClip } from "@standin/contracts";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { SOUNDBOARD_TOOLTIP_DELAY_MS } from "../../../consts/tooltip";
import { PlayTooltip } from "./PlayTooltip";
import { TileIconButton } from "./TileIconButton";

type Props = {
    clip: Pick<SoundboardClip, "name" | "icon">;
    // What the tooltip says while something real disables playing.
    disabledReason: string | null;
    // Also disabled at the limit of plays, with nothing said about it.
    isAtLimit: boolean;
    onPlay: () => void;
};

// Plays the clip into the call. While something disables it, the tooltip says
// what. The tooltip hangs on a wrapper, since a disabled button gets no hover.
export const ClipPlayButton = ({
    clip,
    disabledReason,
    isAtLimit,
    onPlay,
}: Props) => (
    <Tooltip>
        <TooltipTrigger
            delay={SOUNDBOARD_TOOLTIP_DELAY_MS}
            render={<span className="pointer-events-auto flex items-center" />}
        >
            <TileIconButton
                label={`Tocar ${clip.name} na chamada`}
                disabled={disabledReason !== null || isAtLimit}
                onClick={onPlay}
            >
                <PlayIcon />
            </TileIconButton>
        </TooltipTrigger>
        <PlayTooltip clip={clip} disabledReason={disabledReason} />
    </Tooltip>
);
