import {
    TILE_GRID_ASPECT_RATIO,
    TILE_GRID_GAP_PX,
    TILE_GRID_WIDTH_TOLERANCE,
} from "../../consts/stage";
import { useElementSize } from "../../hooks/useElementSize";
import type { StageTile } from "../../types/stage";
import { computeTileGrid } from "../../utils/computeTileGrid";
import { VideoTile } from "./VideoTile";

type AutoFitGridProps = {
    tiles: StageTile[];
    onSelect: (id: string) => void;
};

// Fills the space it is given with the largest tiles that all fit at once.
// It never scrolls: when the window shrinks, so do the tiles.
export const AutoFitGrid = ({ tiles, onSelect }: AutoFitGridProps) => {
    const { ref, size } = useElementSize<HTMLDivElement>();
    const { tileWidth, tileHeight } = computeTileGrid({
        count: tiles.length,
        width: size.width,
        height: size.height,
        gap: TILE_GRID_GAP_PX,
        aspectRatio: TILE_GRID_ASPECT_RATIO,
        widthTolerance: TILE_GRID_WIDTH_TOLERANCE,
    });

    return (
        <div
            ref={ref}
            className="flex min-h-0 min-w-0 flex-1 flex-wrap content-center items-center justify-center overflow-hidden"
            style={{ gap: TILE_GRID_GAP_PX }}
        >
            {tileWidth > 0 &&
                tiles.map((tile) => (
                    <div
                        key={tile.id}
                        className="shrink-0"
                        style={{ width: tileWidth, height: tileHeight }}
                    >
                        <VideoTile
                            tile={tile}
                            onSelect={() => onSelect(tile.id)}
                            className="aspect-auto size-full"
                        />
                    </div>
                ))}
        </div>
    );
};
