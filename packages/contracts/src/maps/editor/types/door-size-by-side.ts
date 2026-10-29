import type { DoorSide } from "../../layout/findDoorSlots";

// The footprint, in tiles, of the door variant that fits each side of a wall.
export type DoorSizeBySide = Record<DoorSide, { w: number; h: number }>;
