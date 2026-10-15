import {
    TILE_SELECTION_COLOR,
    TILE_TOP_COLOR,
} from "../../consts/categoryMeta";
import {
    TILE_HOVER_OUTLINE,
    TILE_PREVIEW_OUTLINE,
    TILE_SHEET_VEIL,
    TILE_TINT_PERCENT,
} from "../../consts/sheetStyle";

// The tint over a tile: the color of its category, or a shade when the
// legend is highlighting something else.
export const getTileBackground = (
    color: string,
    hasCategory: boolean,
    dimmed: boolean
): string | undefined => {
    if (dimmed) return TILE_SHEET_VEIL;
    if (!hasCategory) return undefined;
    return `color-mix(in srgb, ${color} ${TILE_TINT_PERCENT}%, transparent)`;
};

// The outline of a tile, by what is most worth saying about it: it is
// selected, it is the top of the selected wall, a tool is about to touch it, or the
// pointer is over it.
export const getTileOutline = (state: {
    selected: boolean;
    top: boolean;
    previewed: boolean;
    hovered: boolean;
}): string | undefined => {
    if (state.selected) return `2px solid ${TILE_SELECTION_COLOR}`;
    if (state.top) return `2px dashed ${TILE_TOP_COLOR}`;
    if (state.previewed) return TILE_PREVIEW_OUTLINE;
    if (state.hovered) return TILE_HOVER_OUTLINE;
    return undefined;
};
