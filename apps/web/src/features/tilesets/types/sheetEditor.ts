import type { TileMeta } from "@standin/contracts";
import type { useTileSheetEditor } from "../hooks/editor/useSheetEditor";
import type { TileSheetGrid } from "./sheet";

// The state of the tile editor and what can be done to it, as the hook gives it.
export type TileSheetEditor = ReturnType<typeof useTileSheetEditor>;

// What every piece of the editor reads from the context: the editor itself, the
// sheet it works on, and the side panel that can be closed.
export type TileEditorContextValue = TileSheetEditor & {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    // Nothing can be changed while the tileset is being saved.
    disabled: boolean;
    propertiesOpen: boolean;
    toggleProperties: () => void;
};
