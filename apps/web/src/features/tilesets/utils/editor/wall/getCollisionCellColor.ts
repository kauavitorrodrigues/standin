import { WALL_COLLISION_COLOR } from "../../../consts/wall";

// The fill of a cell of the collision grid: the color of the layer when the
// cell blocks, nothing when it does not.
export const getCollisionCellColor = (solid: boolean): string => {
    switch (solid) {
        case true:
            return WALL_COLLISION_COLOR;
        default:
            return "transparent";
    }
};
