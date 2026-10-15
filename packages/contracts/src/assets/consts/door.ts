import { ASSET_ROTATIONS } from "../enums/asset-rotation";

export const DOOR_SIDES = {
    NORTH: "north",
    SOUTH: "south",
    EAST: "east",
    WEST: "west",
} as const;

// The rotation of a door sprite for the wall it stands in, clockwise from the
// north wall.
export const DOOR_SIDE_BY_ROTATION = {
    [ASSET_ROTATIONS.DEG_0]: DOOR_SIDES.NORTH,
    [ASSET_ROTATIONS.DEG_90]: DOOR_SIDES.EAST,
    [ASSET_ROTATIONS.DEG_180]: DOOR_SIDES.SOUTH,
    [ASSET_ROTATIONS.DEG_270]: DOOR_SIDES.WEST,
} as const;

export const ROTATION_BY_DOOR_SIDE = {
    [DOOR_SIDES.NORTH]: ASSET_ROTATIONS.DEG_0,
    [DOOR_SIDES.EAST]: ASSET_ROTATIONS.DEG_90,
    [DOOR_SIDES.SOUTH]: ASSET_ROTATIONS.DEG_180,
    [DOOR_SIDES.WEST]: ASSET_ROTATIONS.DEG_270,
} as const;
