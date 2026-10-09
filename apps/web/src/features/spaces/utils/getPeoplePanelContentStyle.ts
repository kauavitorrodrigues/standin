import type { CSSProperties } from "react";
import { PEOPLE_PANEL_WIDTH_REM } from "@/features/spaces/consts/peoplePanel";
import { RAIL_WIDTH_CSS_VALUE } from "@/features/spaces/consts/rail";

// With the people panel open the content starts after it. The offset var is
// cleared inside, so the overlays that skip the rail (controls, stage) stay
// flush with it.
export const getPeoplePanelContentStyle = (
    isPanelMounted: boolean
): CSSProperties | undefined =>
    isPanelMounted
        ? ({
            marginLeft: `calc(${RAIL_WIDTH_CSS_VALUE} + ${PEOPLE_PANEL_WIDTH_REM}rem)`,
            "--rail-width": "0px",
        } as CSSProperties)
        : undefined;
