import type { TileMeta } from "@standin/contracts";
import {
    TILE_ENTRY_EDIT_STATES,
    type TileEntryEditState,
} from "../../consts/entryEditStates";

// A tile already saved on an image used by maps only accepts a blankDefault
// change. Any other entry is free.
export const getTileEntryEditState = (
    imageInUse: boolean,
    saved: TileMeta | null,
    index: number
): TileEntryEditState => {
    const isSaved = saved !== null && String(index) in saved;
    if (imageInUse && isSaved) return TILE_ENTRY_EDIT_STATES.BLANK_DEFAULT_ONLY;
    return TILE_ENTRY_EDIT_STATES.FULL;
};
