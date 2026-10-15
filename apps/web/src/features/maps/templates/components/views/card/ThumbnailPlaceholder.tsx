import { ImageOff } from "lucide-react";
import { getThumbnailAspectStyle } from "../../../utils/getThumbnailAspectStyle";

type Props = { width: number; height: number };

// Same proportion as the map, fitted inside the box of the photo (the parent
// is a size container, so the units below are its width and height).
export const ThumbnailPlaceholder = ({ width, height }: Props) => (
    <div
        style={{
            ...getThumbnailAspectStyle(width, height),
            width: `min(100cqw, calc(100cqh * ${width} / ${height}))`,
        }}
        className="bg-muted/50 text-muted-foreground flex items-center justify-center"
    >
        <ImageOff className="size-6 opacity-50" />
    </div>
);
