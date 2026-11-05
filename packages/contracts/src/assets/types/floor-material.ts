import type { FLOOR_MATERIALS } from "../enums/floor-material";

export type FloorMaterial =
    (typeof FLOOR_MATERIALS)[keyof typeof FLOOR_MATERIALS];
