import { ERASE_TARGETS } from "@/features/maps/__shared__/consts/erase-targets";
import { PANEL_TABS } from "@/features/maps/__shared__/consts/panelTabs";
import type { EraseTarget } from "@/features/maps/__shared__/types/erase-target";

// What the eraser removes for the open tab of the panel. Anything that is not
// the objects tab (including a state with no tab) keeps erasing tiles.
export const getEraseTarget = (panelTab: string | undefined): EraseTarget => {
    switch (panelTab) {
        case PANEL_TABS.OBJECTS:
            return ERASE_TARGETS.OBJECTS;
        default:
            return ERASE_TARGETS.TILES;
    }
};
