import { SPACE_VIEWS, type SpaceView } from "@/features/spaces/consts/view";
import { getPeoplePanelContentStyle } from "@/features/spaces/utils/getPeoplePanelContentStyle";

type SpacePageLayoutOptions = {
    view: SpaceView;
    stageTileCount: number;
    isPeoplePanelMounted: boolean;
};

// What is shown over the map for the current view, and how the content makes
// room for the people panel.
export const useSpacePageLayout = ({
    view,
    stageTileCount,
    isPeoplePanelMounted,
}: SpacePageLayoutOptions) => {
    const isSpaceView = view === SPACE_VIEWS.SPACE;

    return {
        isControlsVisible: isSpaceView,
        isStageToggleVisible: isSpaceView && stageTileCount > 0,
        contentStyle: getPeoplePanelContentStyle(isPeoplePanelMounted),
    };
};
