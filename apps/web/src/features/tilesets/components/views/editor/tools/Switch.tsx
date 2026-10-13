import { TILE_TOOL_META } from "../../../../consts/toolMeta";
import type { TileTool } from "../../../../types/sheet";
import { FloatingPanel } from "../../../layout/FloatingPanel";
import { TileHistoryButtons } from "./History";
import { TileToolButton } from "./Button";
import { TileToolHelp } from "../help/Help";

type Props = {
    tool: TileTool;
    canUndo: boolean;
    canRedo: boolean;
    onToolChange: (tool: TileTool) => void;
    onUndo: () => void;
    onRedo: () => void;
};

// The panel floating on the right of the sheet: the tools one over the other,
// then undo, redo and the help. A tool says how a drag over the sheet behaves.
// It keeps clear of the zoom below it, and scrolls if the editor is too short.
export const TileToolSwitch = ({
    tool,
    canUndo,
    canRedo,
    onToolChange,
    onUndo,
    onRedo,
}: Props) => (
    <FloatingPanel className="top-3 right-3 flex max-h-[calc(100%-6.5rem)] flex-col items-center gap-1 overflow-y-auto p-1">
        {TILE_TOOL_META.map((meta) => (
            <TileToolButton
                key={meta.value}
                meta={meta}
                active={tool === meta.value}
                onClick={() => onToolChange(meta.value)}
            />
        ))}
        <div className="bg-border my-0.5 h-px w-6" />
        <TileHistoryButtons
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
        />
        <TileToolHelp />
    </FloatingPanel>
);
