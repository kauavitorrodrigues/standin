import type { Cell } from "@standin/contracts";

export type PaintFloorParams = {
    // Two corners of the rectangle, in tiles. Both are painted.
    from: Cell;
    to: Cell;
    // The tileset by id or name, and the local index of the tile.
    tileset: string;
    tileIndex: number;
    // The tile layer. The ground by default.
    layer?: string;
};
