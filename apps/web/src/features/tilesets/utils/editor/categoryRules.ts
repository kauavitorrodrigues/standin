import { TILE_CATEGORIES } from "@standin/contracts";
import type { TileCategory } from "../../types/meta";

// Only a floor or a wall can be the default tile of the blank map.
export const canBeBlankDefault = (category: TileCategory): boolean => {
    switch (category) {
        case TILE_CATEGORIES.FLOOR:
        case TILE_CATEGORIES.WALL:
            return true;
        default:
            return false;
    }
};

// Only a wall has a tile drawn above it.
export const canHaveTop = (category: TileCategory): boolean => {
    switch (category) {
        case TILE_CATEGORIES.WALL:
            return true;
        default:
            return false;
    }
};
