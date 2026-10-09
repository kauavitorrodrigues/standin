import {
    MAX_VISIBLE_STAGE_TILES,
    STAGE_VIEW_TRANSITION_MS,
} from "@/features/spaces/consts/stage";
import { usePresence } from "@/hooks/usePresence";
import type { StageTile } from "@/features/spaces/types/stage";
import { splitVisibleTiles } from "@/features/spaces/utils/splitVisibleTiles";
import { StageFrame } from "@/features/spaces/components/pages/space-page/stage/StageFrame";
import { AllTilesView } from "@/features/spaces/components/pages/space-page/stage/AllTilesView";
import { OverflowTile } from "@/features/spaces/components/pages/space-page/stage/OverflowTile";
import { VideoTile } from "@/features/spaces/components/pages/space-page/stage/VideoTile";

type VideoStageProps = {
    tiles: StageTile[];
    // Owned by the page so the view toggle can live in the top bar.
    isGridOpen: boolean;
    // The tile the full view opens on, when it was opened from a tile.
    gridTileId?: string;
    onOpenGrid: (tileId?: string) => void;
    onCloseGrid: () => void;
};

export const VideoStage = ({
    tiles,
    isGridOpen,
    gridTileId,
    onOpenGrid,
    onCloseGrid,
}: VideoStageProps) => {
    const { visible, hiddenCount } = splitVisibleTiles(
        tiles,
        MAX_VISIBLE_STAGE_TILES
    );
    // The full view stays mounted while it zooms out.
    const { isMounted: isGridMounted, isExiting } = usePresence(
        isGridOpen,
        STAGE_VIEW_TRANSITION_MS
    );
    // While the full view is on screen (even leaving) the strip is
    // unmounted, so no stream is rendered in two places at once.
    const isStripVisible = tiles.length > 0 && !isGridMounted;

    return (
        <>
            {isStripVisible && (
                <StageFrame>
                    <div className="pointer-events-auto flex min-w-0 max-w-full items-center gap-2 overflow-x-auto rounded-xl bg-neutral-900/50 p-2 shadow-xl ring-1 ring-white/10 backdrop-blur-md">
                        {visible.map((tile) => (
                            <div key={tile.id} className="shrink-0">
                                <VideoTile
                                    tile={tile}
                                    showExpandHint
                                    onSelect={() => onOpenGrid(tile.id)}
                                />
                            </div>
                        ))}
                        {hiddenCount > 0 && (
                            <div className="shrink-0">
                                <OverflowTile
                                    hiddenCount={hiddenCount}
                                    onOpen={() => onOpenGrid()}
                                />
                            </div>
                        )}
                    </div>
                </StageFrame>
            )}
            {isGridMounted && (
                <AllTilesView
                    tiles={tiles}
                    initialTileId={gridTileId}
                    isClosing={isExiting}
                    onClose={onCloseGrid}
                />
            )}
        </>
    );
};
