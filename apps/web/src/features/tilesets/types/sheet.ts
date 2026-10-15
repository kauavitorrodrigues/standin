import type { LucideIcon } from "lucide-react";
import type { TileCategory } from "./meta";

// A tileset sheet as the editor sees it: the grid read from the PNG and the
// margin and spacing that were typed (or saved).
export type TileSheetGrid = {
    columns: number;
    rows: number;
    margin: number;
    spacing: number;
    widthPx: number;
    heightPx: number;
    tileCount: number;
};

// One way the image divides into cells: the margin and the spacing that make
// it fit, and the columns and rows they give.
export type GridSuggestion = {
    margin: number;
    spacing: number;
    columns: number;
    rows: number;
};

// How a drag over the sheet is read: it selects tiles, paints the brush, clears
// the tiles it goes over, draws a line or a rectangle with the brush, fills
// what touches the tile, takes the brush from the tile, or selects the tiles
// that share its category (the ones that touch it, or the whole sheet). The
// default tool makes the tile the default of the blank map, and the top tool
// picks a wall and then the tile drawn above it. The pan tool moves the sheet in its frame.
export type TileTool =
    | "select"
    | "paint"
    | "erase"
    | "line"
    | "rect"
    | "bucket"
    | "picker"
    | "wand"
    | "same"
    | "default"
    | "top"
    | "pan";

// The tools that draw a shape from where the drag starts to where it ends.
export type TileShapeTool = Extract<TileTool, "line" | "rect">;

// What the legend highlights: one category, the tiles that have none, or
// nothing.
export type TileFilter = TileCategory | "UNTAGGED" | null;

// What the tools that paint put on the sheet: a category (and, apart, whether
// the tiles are solid).
export type TileBrush = TileCategory;

// A tile of the highlighted category drawn bright over the shade that dims
// the rest of the sheet: the sheet, and where the tile is in it, in px.
export type TileCutout = {
    url: string;
    widthPx: number;
    heightPx: number;
    srcX: number;
    srcY: number;
    zoom: number;
};

export type TileToolMeta = {
    value: TileTool;
    label: string;
    // What it does, said in its tooltip.
    description: string;
    icon: LucideIcon;
    // The key that switches to this tool.
    shortcut: string;
};

// How a pick of tiles joins what is already selected: it takes its place, is
// added to it, is taken from it, or only what both have stays.
export type SelectionMode = "replace" | "add" | "subtract" | "intersect";

// The way to go from one tile to the next with the arrow keys.
export type TileDirection = "up" | "down" | "left" | "right";
