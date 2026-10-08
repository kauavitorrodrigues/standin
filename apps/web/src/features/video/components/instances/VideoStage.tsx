import { useState } from "react";
import { MAX_VISIBLE_STAGE_TILES } from "../../consts/stage";
import type { StageTile } from "../../types/stage";
import { splitVisibleTiles } from "../../utils/splitVisibleTiles";
import { FloatingStageControls } from "../layout/FloatingStageControls";
import { StageFrame } from "../layout/StageFrame";
import { AllTilesView } from "../views/AllTilesView";
import { OverflowTile } from "../views/OverflowTile";
import { TileSurface } from "../views/TileSurface";
import { VideoTile } from "../views/VideoTile";

export const VideoStage = ({ tiles }: { tiles: StageTile[] }) => {
    // The tile the viewer enlarged below the strip.
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [isGridOpen, setIsGridOpen] = useState(false);

    const { visible, hiddenCount } = splitVisibleTiles(
        tiles,
        MAX_VISIBLE_STAGE_TILES
    );
    const focused = visible.find((tile) => tile.id === focusedId);
    const toggleFocus = (id: string) =>
        setFocusedId((current) => (current === id ? null : id));
    const isStripVisible = tiles.length > 0 && !isGridOpen;

    // Both pieces of state are tied to what is on the stage. Once it is gone
    // they are reset right away (the sanctioned way to derive state while
    // rendering): otherwise an enlarged tile would come back on its own when
    // the same person returns, and an open full view would sit empty over
    // the map with the character still locked.
    if (focusedId !== null && !focused) setFocusedId(null);
    if (isGridOpen && tiles.length === 0) setIsGridOpen(false);

    return (
        <>
            {/* While the full view is open the strip is unmounted, so no
                stream is rendered in two places at once. */}
            {isStripVisible && (
                <StageFrame>
                    <div className="flex max-w-full items-center gap-3">
                        <div className="pointer-events-auto flex min-w-0 max-w-full items-center gap-2 overflow-x-auto rounded-xl bg-neutral-900/50 p-2 shadow-xl ring-1 ring-white/10 backdrop-blur-md">
                            {visible.map((tile) => (
                                <div key={tile.id} className="shrink-0">
                                    <VideoTile
                                        tile={tile}
                                        isSelected={tile.id === focused?.id}
                                        isVideoPaused={tile.id === focused?.id}
                                        onSelect={() => toggleFocus(tile.id)}
                                    />
                                </div>
                            ))}
                            {hiddenCount > 0 && (
                                <div className="shrink-0">
                                    <OverflowTile
                                        hiddenCount={hiddenCount}
                                        onOpen={() => setIsGridOpen(true)}
                                    />
                                </div>
                            )}
                        </div>
                        <FloatingStageControls
                            onExpand={() => setIsGridOpen(true)}
                        />
                    </div>
                    {focused && (
                        <div className="pointer-events-auto relative aspect-video w-[min(60vw,48rem)] overflow-hidden rounded-lg bg-black shadow-2xl ring-1 ring-white/10">
                            <TileSurface tile={focused} />
                            <span className="absolute bottom-2 left-2 rounded-md bg-neutral-900/70 px-2 py-0.5 text-xs text-white backdrop-blur-md">
                                {focused.label}
                            </span>
                        </div>
                    )}
                </StageFrame>
            )}
            {isGridOpen && (
                <AllTilesView
                    tiles={tiles}
                    onClose={() => setIsGridOpen(false)}
                />
            )}
        </>
    );
};
