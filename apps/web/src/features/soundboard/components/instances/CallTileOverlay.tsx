import { useClipTile } from "../../hooks/useClipTile";
import type { TileSlotProps } from "../../types/tile";
import { ClipPlayButton } from "../views/tile/PlayButton";
import { ClipPreviewButton } from "../views/tile/PreviewButton";
import { ClipTileOverlay } from "../views/tile/TileOverlay";

// Over a tile of the panel: listen alone on the left, play into the call on
// the right. The play button carries the reason when the call cannot be
// played into, and the preview stays available.
export const CallTileOverlay = ({ clip }: TileSlotProps) => {
    const tile = useClipTile(clip);

    return (
        <ClipTileOverlay>
            <ClipPreviewButton
                clip={clip}
                isPreviewing={tile.isPreviewing}
                onPreview={tile.preview}
            />
            <ClipPlayButton
                clip={clip}
                disabledReason={tile.disabledReason}
                isAtLimit={tile.isAtLimit}
                onPlay={tile.play}
            />
        </ClipTileOverlay>
    );
};
