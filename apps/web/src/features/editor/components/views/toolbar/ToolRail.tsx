import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { MAP_TOOL_META } from "@/features/editor/consts/toolMeta";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import type { EditorTool } from "@/features/editor/types/tool";

type ToolRailProps = {
    tool: EditorTool;
    // Without the lock only the hand works.
    locked: boolean;
    onToolChange: (tool: EditorTool) => void;
};

// The tools one over the other. One is always on.
export const ToolRail = ({ tool, locked, onToolChange }: ToolRailProps) => (
    <>
        {MAP_TOOL_META.map(({ value, ...meta }) => (
            <ToolbarButton
                key={value}
                {...meta}
                anchorId={value}
                active={tool === value}
                disabled={locked && value !== EDITOR_TOOLS.PAN}
                onClick={() => onToolChange(value)}
            />
        ))}
    </>
);
