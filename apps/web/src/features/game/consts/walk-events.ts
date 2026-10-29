// Events about the walk of a double click, on `game.events`. The scene says
// when a walk starts and ends, and the page can ask it to stop.
export const WALK_EVENTS = {
    // The payload is true while the avatar walks to a tile, false when the
    // walk ends, whether it arrived, was cancelled or was dropped.
    CHANGED: "walk:changed",
    // Asks the scene to stop the walk. The avatar finishes the tile it is on.
    CANCEL: "walk:cancel",
    // There is no way to the tile that was chosen, or the way closed on the
    // avatar and it could not be planned again.
    FAILED: "walk:failed",
    // A search for a way stopped at its limit and not because every way was
    // tried. The payload has the id of the map and the two tiles.
    LIMIT_REACHED: "walk:limit-reached",
    // Where the walk that starts goes (a WalkPurpose), told before CHANGED.
    PURPOSE: "walk:purpose",
} as const;
