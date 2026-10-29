import type { Cell } from "@standin/contracts";

// A footprint size, in tiles.
export type TileSize = { w: number; h: number };

// A room zone in pixels, as the layout stores it.
export type ZoneBox = { x: number; y: number; width: number; height: number };

// Where a door goes in a wall: the wall cells it takes and the anchor a slot
// there has.
export type DoorGap = { cells: Cell[]; tileX: number; tileY: number };
