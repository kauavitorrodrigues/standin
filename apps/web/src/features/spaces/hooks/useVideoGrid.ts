import { useState } from "react";
import { STAGE_VIEWS, type StageView } from "@/features/spaces/consts/stage";

// Owned by the page, not by VideoStage, because the button that opens the
// full view lives in the controls bar.
export const useVideoGrid = (tileCount: number) => {
    const [isGridOpen, setIsGridOpen] = useState(false);
    const [gridTileId, setGridTileId] = useState<string | undefined>();

    const openGrid = (tileId?: string) => {
        setGridTileId(tileId);
        setIsGridOpen(true);
    };
    const closeGrid = () => setIsGridOpen(false);

    // Reset right away once the stage empties (the sanctioned way to derive
    // state while rendering): an open full view would otherwise sit empty
    // over the map with the character still locked.
    if (isGridOpen && tileCount === 0) setIsGridOpen(false);

    const stageView = isGridOpen ? STAGE_VIEWS.GRID : STAGE_VIEWS.OFFICE;
    const changeStageView = (next: StageView) =>
        next === STAGE_VIEWS.GRID ? openGrid() : closeGrid();

    return {
        isGridOpen,
        gridTileId,
        openGrid,
        closeGrid,
        stageView,
        changeStageView,
    };
};
