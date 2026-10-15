import { WALL_PIECES, type WallPiece } from "@standin/contracts";

// The name a wall piece gets when the tile has no style yet.
export const DEFAULT_WALL_STYLE = "Parede";

// Where the eight pieces sit on the panel, like the outline of a room seen
// from above. The middle is the tile itself.
export const WALL_PIECE_GRID: readonly (readonly (WallPiece | null)[])[] = [
    [WALL_PIECES.NW, WALL_PIECES.N, WALL_PIECES.NE],
    [WALL_PIECES.W, null, WALL_PIECES.E],
    [WALL_PIECES.SW, WALL_PIECES.S, WALL_PIECES.SE],
];

export const WALL_PIECE_LABELS: Record<WallPiece, string> = {
    [WALL_PIECES.N]: "Norte",
    [WALL_PIECES.NE]: "Nordeste",
    [WALL_PIECES.E]: "Leste",
    [WALL_PIECES.SE]: "Sudeste",
    [WALL_PIECES.S]: "Sul",
    [WALL_PIECES.SW]: "Sudoeste",
    [WALL_PIECES.W]: "Oeste",
    [WALL_PIECES.NW]: "Noroeste",
};

// Zoom of the tile drawn big in the wall panel, so its cells can be painted.
export const WALL_PANEL_ZOOM = 6;

// The collision grid of a wall tile has this many cells per side.
export const WALL_COLLISION_CELLS = 4;

// The fill of a cell that blocks, in the collision grid of the wall panel.
export const WALL_COLLISION_COLOR = "rgba(249, 115, 22, 0.45)";

export const WALL_PAINT_ACTIONS = {
    PAINT: "paint",
    ERASE: "erase",
} as const;

export type WallPaintAction =
    (typeof WALL_PAINT_ACTIONS)[keyof typeof WALL_PAINT_ACTIONS];
