import { TILESET_MESSAGES } from "../consts/messages";

// What the user is told after saving, by what was saved: the grid, the
// categories, or both.
export const getTilesetSavedMessage = (
    gridChanged: boolean,
    metaChanged: boolean
): string => {
    if (gridChanged && metaChanged) {
        return TILESET_MESSAGES.GRID_AND_TILE_META_SAVED;
    }
    if (gridChanged) return TILESET_MESSAGES.GRID_SAVED;
    return TILESET_MESSAGES.TILE_META_SAVED;
};
