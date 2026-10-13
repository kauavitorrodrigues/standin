import type { TileCategory } from "../../types/meta";
import type { TileFilter } from "../../types/sheet";

// Whether the legend is on one of the categories, and not off or on the
// tiles that have none.
export const isCategoryFilter = (
    filter: TileFilter
): filter is TileCategory => {
    switch (filter) {
        case null:
        case "UNTAGGED":
            return false;
        default:
            return true;
    }
};

// Whether a tile that is drawn is shaded. Only with the legend on the tiles
// that have no category, and then the ones that have one are. With a category
// on, the shade is over the whole sheet and this tile is cut out of it.
export const isDimmedTile = (
    filter: TileFilter,
    category: TileCategory | undefined
): boolean => {
    switch (filter) {
        case "UNTAGGED":
            return category !== undefined;
        default:
            return false;
    }
};
