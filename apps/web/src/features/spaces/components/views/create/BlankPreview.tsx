import { SIZE_TIERS, type SizeTier } from "@standin/contracts";
import { getThumbnailAspectStyle } from "@/features/maps/templates/utils/getThumbnailAspectStyle";
import { getPreviewWidth } from "../../../utils/getPreviewWidth";
import { BlankPlaceholder } from "./BlankPlaceholder";
import { LiveBlankPreview } from "./LiveBlankPreview";

type Props = { tier: SizeTier; active: boolean };

// The blank map of a tier, in its proportion. The message is what is seen
// while the real one (floor and walls) loads, and all there is if it never
// does. The parent is a size container.
export const BlankPreview = ({ tier, active }: Props) => {
    const { maxWidth, maxHeight } = SIZE_TIERS[tier];

    return (
        <div
            style={{
                ...getThumbnailAspectStyle(maxWidth, maxHeight),
                width: getPreviewWidth(maxWidth, maxHeight),
            }}
            className="relative overflow-hidden rounded-2xl bg-muted/50 shadow-xl ring-1 ring-foreground/10"
        >
            <BlankPlaceholder width={maxWidth} height={maxHeight} />
            <ActiveBlankPreview tier={tier} active={active} />
        </div>
    );
};

const ActiveBlankPreview = ({ tier, active }: Props) => {
    if (!active) return null;

    return <LiveBlankPreview key={tier} tier={tier} />;
};
