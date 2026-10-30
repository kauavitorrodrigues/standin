import { TooltipContent } from "@/components/ui/tooltip";
import { ClipTooltipIcon } from "./TooltipIcon";

type Props = {
    // What the button does, or why it cannot.
    label: string;
    // The clip it acts on. Left out when the label says everything.
    name?: string;
    // The icon of that clip, null when it has none.
    icon?: string | null;
};

// The tooltip of the buttons over a tile: the icon of the clip, the label at
// a lower weight, then the name, on one line. The popup has its own inverted
// colors, so the text takes them from it and only the label is dimmed.
export const ClipTooltipContent = ({ label, name, icon }: Props) => (
    <TooltipContent>
        <span className="flex items-center gap-1.5">
            <ClipTooltipIcon icon={icon} />
            <span className="opacity-70">{label}</span>
            <ClipName name={name} />
        </span>
    </TooltipContent>
);

const ClipName = ({ name }: { name: string | undefined }) => {
    if (name === undefined) return null;

    return <span className="max-w-48 truncate">{name}</span>;
};
