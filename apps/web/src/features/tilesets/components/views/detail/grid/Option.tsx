import type { LucideIcon } from "lucide-react";
import { CheckIcon } from "lucide-react";
import { IMAGE_COLOR } from "@/features/assets/consts/editorColors";

type Props = {
    icon: LucideIcon;
    title: string;
    // What else it says, small and quiet.
    description: string;
    active: boolean;
    onClick: () => void;
};

// One option of the grid picker: an icon in the color of the image, what it is
// and, below it, the little that sets it apart.
export const TilesetGridOption = ({
    icon: Icon,
    title,
    description,
    active,
    onClick,
}: Props) => (
    <button
        type="button"
        onClick={onClick}
        className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-md px-1.5 py-1.5 text-left outline-hidden"
    >
        <span
            className="flex size-7 shrink-0 items-center justify-center rounded-md"
            style={{
                color: IMAGE_COLOR,
                backgroundColor: `color-mix(in srgb, ${IMAGE_COLOR} 15%, transparent)`,
            }}
        >
            <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-muted-foreground text-xs">{description}</span>
        </span>
        <ActiveCheck show={active} />
    </button>
);

const ActiveCheck = ({ show }: { show: boolean }) => {
    if (!show) return null;

    return <CheckIcon className="size-4 shrink-0" />;
};
