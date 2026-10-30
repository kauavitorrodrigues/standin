import type { SoundboardClip } from "@standin/contracts";
import { ClipTooltipContent } from "./TooltipContent";

type Props = {
    clip: Pick<SoundboardClip, "name" | "icon">;
    disabledReason: string | null;
};

const PLAY_LABEL = "Tocar";

// "Tocar" and the name, or only the reason while the button is disabled.
export const PlayTooltip = ({ clip, disabledReason }: Props) => {
    if (disabledReason !== null) {
        return <ClipTooltipContent label={disabledReason} />;
    }

    return (
        <ClipTooltipContent
            label={PLAY_LABEL}
            name={clip.name}
            icon={clip.icon}
        />
    );
};
