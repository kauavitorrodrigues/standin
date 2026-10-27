import { useEffect } from "react";
import { STAGE_VIEW_TRANSITION_MS } from "@/features/spaces/consts/stage";
import { useStageCarousel } from "@/features/spaces/hooks/useStageCarousel";
import { usePresence } from "@/hooks/usePresence";
import type { MediaView } from "@/features/game/multiplayer/types/mediaView";
import type { StageTile } from "@/features/spaces/types/stage";
import { StageFrame } from "@/features/spaces/components/pages/space-page/stage/StageFrame";
import { AllTilesView } from "@/features/spaces/components/pages/space-page/stage/AllTilesView";
import { CarouselControls } from "@/features/spaces/components/pages/space-page/stage/CarouselControls";
import { VideoTile } from "@/features/spaces/components/pages/space-page/stage/VideoTile";

type VideoStageProps = {
    tiles: StageTile[];
    // Owned by the page so the view toggle can live in the top bar.
    isGridOpen: boolean;
    // The tile the full view opens on, when it was opened from a tile.
    gridTileId?: string;
    onOpenGrid: (tileId?: string) => void;
    onCloseGrid: () => void;
    pinnedIds: readonly string[];
    onTogglePin: (tileId: string) => void;
    // Ids of the videos on screen, or `null` for all of them. Videos off the
    // current page are not attached, so they are not decoded.
    onActiveVideosChange: (ids: ReadonlySet<string> | null) => void;
    // Who is in a big tile of the full view, with the layer each one needs.
    onFocusChange: (views: MediaView[]) => void;
};

export const VideoStage = ({
    tiles,
    isGridOpen,
    gridTileId,
    onOpenGrid,
    onCloseGrid,
    pinnedIds,
    onTogglePin,
    onActiveVideosChange,
    onFocusChange,
}: VideoStageProps) => {
    const {
        visible,
        carouselIndex,
        pageCount,
        goToNextPage,
        goToPreviousPage,
    } = useStageCarousel(tiles, pinnedIds);
    // The full view stays mounted while it zooms out.
    const { isMounted: isGridMounted, isExiting } = usePresence(
        isGridOpen,
        STAGE_VIEW_TRANSITION_MS
    );
    // While the full view is on screen (even leaving) the strip is
    // unmounted, so no stream is rendered in two places at once.
    const isStripVisible = tiles.length > 0 && !isGridMounted;

    const activeKey = isGridMounted
        ? null
        : visible.map((tile) => tile.id).join("|");
    useEffect(() => {
        onActiveVideosChange(
            activeKey === null ? null : new Set(activeKey.split("|"))
        );
    }, [activeKey, onActiveVideosChange]);
    useEffect(
        () => () => onActiveVideosChange(null),
        [onActiveVideosChange]
    );

    return (
        <>
            {isStripVisible && (
                <StageFrame>
                    <div className="pointer-events-auto flex min-w-0 max-w-full items-center gap-2 overflow-x-auto rounded-xl bg-neutral-900/50 p-2 shadow-xl ring-1 ring-white/10 backdrop-blur-md">
                        <CarouselControls
                            direction="previous"
                            carouselIndex={carouselIndex}
                            pageCount={pageCount}
                            onClick={goToPreviousPage}
                        />
                        {visible.map((tile) => (
                            <div key={tile.id} className="shrink-0">
                                <VideoTile
                                    tile={tile}
                                    showExpandHint
                                    isPinned={pinnedIds.includes(tile.id)}
                                    onTogglePin={() => onTogglePin(tile.id)}
                                    onSelect={() => onOpenGrid(tile.id)}
                                />
                            </div>
                        ))}
                        <CarouselControls
                            direction="next"
                            carouselIndex={carouselIndex}
                            pageCount={pageCount}
                            onClick={goToNextPage}
                        />
                    </div>
                </StageFrame>
            )}
            {isGridMounted && (
                <AllTilesView
                    tiles={tiles}
                    initialTileId={gridTileId}
                    isClosing={isExiting}
                    onClose={onCloseGrid}
                    onFocusChange={onFocusChange}
                />
            )}
        </>
    );
};
