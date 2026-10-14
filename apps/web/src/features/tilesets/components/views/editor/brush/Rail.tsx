import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { ToolbarDivider } from "@/features/editor/components/layout/ToolbarDivider";
import { ToolOptionsPanel } from "@/features/editor/components/layout/ToolOptionsPanel";
import { LockIcon } from "lucide-react";
import { TILE_CATEGORY_META } from "../../../../consts/categoryMeta";
import { TILE_EDITOR_KEYS } from "../../../../consts/editorKeys";
import type { TileBrush, TileTool } from "../../../../types/sheet";
import { usesBrush } from "../../../../utils/editor/toolRules";

type Props = {
    tool: TileTool;
    brush: TileBrush;
    solid: boolean;
    disabled: boolean;
    onBrushChange: (brush: TileBrush) => void;
    onSolidChange: (solid: boolean) => void;
};

// The panel that shows up with the tools that paint, beside the tool: the
// category and whether it is solid, one over the other. They are the brush.
export const TileBrushRail = ({
    tool,
    brush,
    solid,
    disabled,
    onBrushChange,
    onSolidChange,
}: Props) => (
    <ToolOptionsPanel open={usesBrush(tool)}>
        {TILE_CATEGORY_META.map(({ value, ...meta }) => (
            <ToolbarButton
                key={value}
                {...meta}
                active={brush === value}
                disabled={disabled}
                onClick={() => onBrushChange(value)}
            />
        ))}
        <ToolbarDivider />
        <ToolbarButton
            label="Sólido"
            description="O avatar não passa pelo que for pintado"
            icon={LockIcon}
            shortcut={TILE_EDITOR_KEYS.TOGGLE_SOLID[0].toUpperCase()}
            active={solid}
            activeLook="toggle"
            disabled={disabled}
            onClick={() => onSolidChange(!solid)}
        />
    </ToolOptionsPanel>
);
