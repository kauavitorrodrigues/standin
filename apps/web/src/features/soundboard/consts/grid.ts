// The tiles of a group go three to a line when the card is wide enough for
// them, and two otherwise. The card is as wide as the controls under it.
export const SOUNDBOARD_MAX_COLUMNS = 3;
export const SOUNDBOARD_MIN_COLUMNS = 2;

// The narrowest a tile may get before a column is dropped.
export const SOUNDBOARD_MIN_TILE_WIDTH_PX = 104;

export const SOUNDBOARD_GRID_GAP_PX = 4;

// Row heights are fixed, so the virtual list needs no measuring. A tile row
// includes the gap under it.
export const SOUNDBOARD_HEADER_ROW_HEIGHT_PX = 32;
export const SOUNDBOARD_TILE_ROW_HEIGHT_PX = 48;
export const SOUNDBOARD_STATE_ROW_HEIGHT_PX = 48;

export const SOUNDBOARD_ROW_OVERSCAN = 4;

// The next page of a group is asked for when its last rows are this close.
export const SOUNDBOARD_FETCH_AHEAD_ROWS = 2;
export const SOUNDBOARD_PANEL_STATE_ROW_HEIGHT_PX = 96;
