import { Volume2Icon } from "lucide-react";

type Props = {
    // The emoji of the clip, null for the speaker that stands for none, and
    // undefined when the tooltip has no clip to show.
    icon: string | null | undefined;
};

const FRAME = "flex size-4 shrink-0 items-center justify-center";

// The icon of the clip inside a tooltip. It takes the color of the popup,
// which is light on a dark ground, unlike the one on the tile.
export const ClipTooltipIcon = ({ icon }: Props) => {
    if (icon === undefined) return null;
    if (icon === null) {
        return (
            <span className={FRAME} aria-hidden>
                <Volume2Icon className="size-3.5" />
            </span>
        );
    }

    return (
        <span className={FRAME} aria-hidden>
            {icon}
        </span>
    );
};
