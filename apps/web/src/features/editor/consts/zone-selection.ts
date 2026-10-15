// How a zone is selected, grabbed and drawn when selected.
//
// DEPTH is the depth of the zone provider in the selection registry. Placed
// objects score between 1 and 9 (PLACED_ASSET_DEPTH), so 10 makes a zone WIN
// over the object under it: the zone is drawn over the objects (EDITOR_ZONES
// DEPTH), so what the user sees on top is what a click picks. The cost is that
// an object under an area is out of reach while zones show. The way to reach
// it is the zones toggle: with zones hidden the provider answers nothing.
// Among zones the smaller area wins, so a spawn inside a big area stays
// reachable.
export const ZONE_SELECTION = {
    DEPTH: 10,
    ID_PREFIX: "zone:",
    SELECTED_COLOR: 0xffffff,
    SELECTED_FILL_ALPHA: 0.18,
    SELECTED_LINE_WIDTH: 3,
    HANDLE_SIZE: 10,
    HANDLE_HIT_SIZE: 16,
    HANDLE_FILL: 0xffffff,
    HANDLE_STROKE: 0x0f172a,
    HANDLE_STROKE_WIDTH: 2,
} as const;
