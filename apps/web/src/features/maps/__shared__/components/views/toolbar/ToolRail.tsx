import { ToolbarButton } from "@/components/editor/ToolbarButton";
import { MAP_TOOL_META } from "@/features/maps/__shared__/consts/toolMeta";
import { EDITOR_TOOLS } from "@/features/maps/__shared__/consts/tools";
import type { EditorTool } from "@/features/maps/__shared__/types/tool";

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
