import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import type { EditorTool } from "@/features/editor/types/tool";
import type { EditorToolMeta } from "@/features/editor/types/tool-meta";

type ToolRailProps = {
    tools: readonly EditorToolMeta[];
    tool: EditorTool;
    // Without the lock only the hand works.
    locked: boolean;
    onToolChange: (tool: EditorTool) => void;
};

// The tools one over the other. One is always on.
export const ToolRail = ({
    tools,
    tool,
    locked,
    onToolChange,
}: ToolRailProps) => (
    <>
        {tools.map(({ value, ...meta }) => (
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
