import type { CSSProperties } from "react";
import { FOOTPRINT_COLOR } from "../consts/editorColors";
import { getFootprintBoxStyle } from "./getFootprintBoxStyle";

// The hovered tile gets a stronger tint, so it shows what a click will change.
const HOVER_TINT_PERCENT = 45;

// A free tile is only a faint dashed outline.
const getFreeTileStyle = (hovered: boolean): CSSProperties => {
    if (hovered) {
        return {
            borderColor: FOOTPRINT_COLOR,
            borderStyle: "dashed",
            backgroundColor: `color-mix(in srgb, ${FOOTPRINT_COLOR} ${HOVER_TINT_PERCENT}%, transparent)`,
            opacity: 0.8,
        };
    }
    return {
        borderColor: FOOTPRINT_COLOR,
        borderStyle: "dashed",
        opacity: 0.4,
    };
};

// How one tile of the footprint is drawn: the occupied ones look like the
// footprint without a mask, the free ones are an empty dashed outline.
export const getFootprintTileStyle = (
    solid: boolean,
    occupied: boolean,
    hovered = false
): CSSProperties => {
    if (!occupied) return getFreeTileStyle(hovered);
    if (!hovered) return getFootprintBoxStyle(solid, 0);
    return {
        ...getFootprintBoxStyle(solid, 0),
        backgroundColor: `color-mix(in srgb, ${FOOTPRINT_COLOR} ${HOVER_TINT_PERCENT}%, transparent)`,
        boxShadow: `inset 0 0 0 2px ${FOOTPRINT_COLOR}`,
    };
};
