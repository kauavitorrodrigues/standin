import type { SoundboardClip } from "@standin/contracts";
import { ClipTooltipContent } from "./TooltipContent";

type Props = { clip: Pick<SoundboardClip, "name" | "icon"> };

const PREVIEW_LABEL = "Pré-visualizar";

// "Pré-visualizar" and the name of the clip.
export const PreviewTooltip = ({ clip }: Props) => (
    <ClipTooltipContent
        label={PREVIEW_LABEL}
        name={clip.name}
        icon={clip.icon}
    />
);
