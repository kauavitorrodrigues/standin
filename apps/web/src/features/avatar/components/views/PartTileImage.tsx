import { useTrimmedSprite } from "../../hooks/useTrimmedSprite";
import type { AvatarCategoryPartVariation } from "../../types/editor";

type PartTileImageProps = { variation: AvatarCategoryPartVariation };

// The picture of a part in the grid: its own preview, trimmed to its own
// pixels.
export const PartTileImage = ({ variation }: PartTileImageProps) => {
    const canvasRef = useTrimmedSprite(variation.previewUrl, null);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className="size-full min-h-0 min-w-0 object-contain [image-rendering:pixelated]"
        />
    );
};
