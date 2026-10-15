import type { ReactNode } from "react";
import type { TileMeta } from "@standin/contracts";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TILE_EDITOR_TOOLTIP_DELAY_MS } from "../../../consts/editorTooltip";
import {
    EDITOR_PANEL_DEFAULT_SIZE,
    EDITOR_PANEL_ID,
    EDITOR_PANEL_MIN_SIZE,
} from "../../../consts/propertiesPanel";
import { useTileEditorLayout } from "../../../hooks/editor/useEditorLayout";
import type { TileSheetGrid } from "../../../types/sheet";
import { TileEditorBrush } from "./Brush";
import { TileEditorCanvas } from "./Canvas";
import { TileEditorOptions } from "./Options";
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
    // What goes on top of the panel of properties: the fields of the page that
    // holds the workspace.
    children?: ReactNode;
};

// The tile editor, in two resizable panels. The left is the panel of
// properties, which can be folded. The right is the editor proper: the sheet
// takes the whole area, and the options, the tools and the status float over
// it, like in Figma. The panels touch the edges of the page, like the
// areas of a code editor, so the negative margins of the wrapper cancel the
// padding of the page content (the group sets its own height, so the margins
// cannot go on it). That page must not scroll its content, so the workspace can
// take the height that is left. The sizes are kept in the browser.
export const TileSheetWorkspace = ({ children, ...editor }: Props) => {
    const layout = useTileEditorLayout();

    return (
        <TileEditorProvider {...editor}>
            <div className="-m-6 h-[calc(100%+3rem)] min-h-0 w-[calc(100%+3rem)]">
                <ResizablePanelGroup orientation="horizontal" {...layout}>
                    <TileEditorProperties>{children}</TileEditorProperties>
                    <ResizablePanel
                        id={EDITOR_PANEL_ID}
                        defaultSize={EDITOR_PANEL_DEFAULT_SIZE}
                        minSize={EDITOR_PANEL_MIN_SIZE}
                    >
                        <TooltipProvider delay={TILE_EDITOR_TOOLTIP_DELAY_MS}>
                            <div className="relative h-full min-w-0">
                                <TileEditorCanvas />
                                <div className="pointer-events-none absolute top-3 right-16 z-10 flex flex-col items-end gap-2">
                                    <TileEditorBrush />
                                    <TileEditorOptions />
                                </div>
                                <TileEditorToolbar />
                                <TileEditorStatus />
                            </div>
                        </TooltipProvider>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </TileEditorProvider>
    );
};
