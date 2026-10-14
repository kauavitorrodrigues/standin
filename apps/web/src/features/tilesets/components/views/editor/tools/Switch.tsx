import { HistoryButtons } from "@/features/editor/components/views/HistoryButtons";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { ToolbarDivider } from "@/features/editor/components/layout/ToolbarDivider";
import { VerticalToolbar } from "@/features/editor/components/layout/VerticalToolbar";
import { TILE_TOOL_META } from "../../../../consts/toolMeta";
import type { TileTool } from "../../../../types/sheet";
import { TileToolHelp } from "../help/Help";

type Props = {
    tool: TileTool;
    canUndo: boolean;
    canRedo: boolean;
    onToolChange: (tool: TileTool) => void;
    onUndo: () => void;
    onRedo: () => void;
};

// The tools of the tile editor: one over the other, then undo, redo and the
// help. A tool says how a drag over the sheet behaves.
export const TileToolSwitch = ({
    tool,
    canUndo,
    canRedo,
    onToolChange,
    onUndo,
    onRedo,
}: Props) => (
    <VerticalToolbar>
        {TILE_TOOL_META.map(({ value, ...meta }) => (
            <ToolbarButton
                key={value}
                {...meta}
                anchorId={value}
                active={tool === value}
                onClick={() => onToolChange(value)}
            />
        ))}
        <ToolbarDivider />
        <HistoryButtons
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
        />
        <TileToolHelp />
    </VerticalToolbar>
);
