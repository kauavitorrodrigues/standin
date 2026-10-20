import { ImageOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PART_THUMB_BOX } from "../../../consts/preview";
import { getSheetThumbStyle } from "../../../utils/admin/getSheetThumbStyle";

type Props = {
    name: string;
    // The image made for lists. Without it the first frame of the sheet shows.
    previewUrl: string | null;
    sheetUrl: string | null;
    // Square box the sheet frame fits in. Defaults to the row thumbnail size.
    box?: number;
    // Overrides the outer box's size, for a card's full-width picture.
    className?: string;
};

type ContentProps = Props & { box: number };

const ThumbContent = ({ name, previewUrl, sheetUrl, box }: ContentProps) => {
    if (previewUrl !== null) {
        return (
            <img
                src={previewUrl}
                alt={name}
                className="size-full object-contain [image-rendering:pixelated]"
            />
        );
    }
    if (sheetUrl !== null) {
        return (
            <div
                role="img"
                aria-label={name}
                style={getSheetThumbStyle(sheetUrl, box)}
            />
        );
    }
    return <ImageOffIcon className="text-muted-foreground size-6" />;
};

// The picture of a part, a category or a base in the admin lists, a square
// thumbnail by default or, with a className, a card's full-width picture.
export const ImageThumb = ({
    box = PART_THUMB_BOX,
    className,
    ...props
}: Props) => (
    <div
        className={cn(
            "bg-muted flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
            className
        )}
        style={className === undefined ? { width: box, height: box } : undefined}
    >
        <ThumbContent {...props} box={box} />
    </div>
);
