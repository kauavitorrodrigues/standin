import type { RefObject } from "react";
import type { PanelSize, usePanelRef } from "react-resizable-panels";
import type { TileMeta } from "@standin/contracts";
import type { useTileSheetEditor } from "../hooks/editor/useSheetEditor";
import type { TileSheetGrid } from "./sheet";

// The state of the tile editor and what can be done to it, as the hook gives it.
export type TileSheetEditor = ReturnType<typeof useTileSheetEditor>;

// What every piece of the editor reads from the context: the editor itself, the
// sheet it works on, and the panel of properties that can be folded.
export type TileEditorContextValue = TileSheetEditor & {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    // Nothing can be changed while the tileset is being saved.
    disabled: boolean;
    propertiesOpen: boolean;
    toggleProperties: () => void;
    // To fold and open it, and to know when it was pulled all the way in.
    propertiesPanelRef: ReturnType<typeof usePanelRef>;
    propertiesPanelElementRef: RefObject<HTMLDivElement | null>;
    // Tells the panel that its divider is held (or let go).
    setDividerHeld: (held: boolean) => void;
    onPropertiesResize: (size: PanelSize) => void;
};
