import type { ReactNode } from "react";
import type { TileMeta } from "@standin/contracts";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TILE_EDITOR_TOOLTIP_DELAY_MS } from "../../../consts/editorTooltip";
import type { TileSheetGrid } from "../../../types/sheet";
import { TileEditorBottomBar } from "./BottomBar";
import { TileEditorCanvas } from "./Canvas";
import { TileEditorToolOptions } from "./ToolOptions";
import { TileEditorPanelOpener } from "./PanelOpener";
import { TileEditorProperties } from "./Properties";
import { TileEditorProvider } from "./Provider";
import { TileEditorStatus } from "./Status";
import { TileEditorToolbar } from "./Toolbar";

type Props = {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    onChange: (meta: TileMeta) => void;
    savedMeta: TileMeta | null;
    imageInUse: boolean;
    disabled: boolean;
    title: string;
    onExit: () => void;
    // The name as the button that opens the menu of the tileset.
    menu?: ReactNode;
    // The actions on the bottom of the sheet (discard, save).
    actions: ReactNode;
    // What goes in the body of the side panel: the fields of the page that
    // holds the workspace.
    children?: ReactNode;
};

// The tile editor, laid out like the map editor: the sheet takes the whole
// area, and everything else floats over it. The side panel is on the left, the
// tools on the right (centered from top to bottom, with the brush and the
// options opening beside the tool in use), the status on the bottom corners and the actions on the bottom
// center. It takes the height of the area it is in.
export const TileSheetWorkspace = ({
    title,
    onExit,
    menu,
    actions,
    children,
    ...editor
}: Props) => (
    <TileEditorProvider {...editor}>
        <TooltipProvider delay={TILE_EDITOR_TOOLTIP_DELAY_MS}>
            <div className="relative h-full min-h-0 min-w-0">
                <TileEditorCanvas />
                <TileEditorProperties
                    title={title}
                    onExit={onExit}
                    actions={menu}
                >
                    {children}
                </TileEditorProperties>
                <TileEditorPanelOpener />
                <TileEditorToolOptions />
                <TileEditorToolbar />
                <TileEditorStatus />
                <TileEditorBottomBar>{actions}</TileEditorBottomBar>
            </div>
        </TooltipProvider>
    </TileEditorProvider>
);
