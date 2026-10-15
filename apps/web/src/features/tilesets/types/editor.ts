import type { TileMeta } from "@standin/contracts";

// The marks of the sheet, kept in a form until they are saved.
export type TilesetEditorValues = { tileMeta: TileMeta };

// The dialog that is open over the editor of a tileset, if any.
export type TilesetEditorDialog = "rename" | "delete" | null;
