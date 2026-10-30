import type { ComponentType } from "react";
import type { ClipTilesRow } from "./row";
import type { TileActionsComponent, TileOverlayComponent } from "./tile";

// What a component that draws one line of tiles is given. The panel's tiles
// use the slots; the table draws its own rows, with the same preview and
// actions, and leaves them.
export type TilesRowProps = {
    row: ClipTilesRow;
    columns: number;
    // The width of the list, for what depends on it.
    widthPx: number;
    Overlay: TileOverlayComponent;
    Actions: TileActionsComponent;
};

export type ListHeaderProps = { widthPx: number };

/**
 * What one way of showing the clips decides, so the row model and the
 * virtualizer are the same for all of them: how many tiles go in a line, how
 * tall a line is, what draws it, and what sits above the rows.
 */
export type ClipListLayout = {
    getColumnCount: (widthPx: number) => number;
    getTilesRowHeight: (widthPx: number, columns: number) => number;
    TilesRow: ComponentType<TilesRowProps>;
    Header: ComponentType<ListHeaderProps>;
};

// The columns of the table, in order. The ones with a minimum width appear only
// when the list is at least that wide.
export type TableColumnId =
    "name" | "duration" | "volume" | "uploader" | "date";

export type TableColumn = {
    id: TableColumnId;
    label: string;
    // A CSS track: `minmax(0, 1fr)` for the name, a fixed width for the rest.
    track: string;
    minListWidthPx: number;
};
