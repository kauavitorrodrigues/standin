import { TILE_CATEGORY_META } from "../../../../consts/categoryMeta";
import type { TileBrush, TileTool } from "../../../../types/sheet";
import { usesBrush } from "../../../../utils/editor/toolRules";
import { FloatingPanel } from "../../../layout/FloatingPanel";
import { TileBrushButton } from "./Button";
import { TileSolidToggle } from "./SolidToggle";

type Props = {
    tool: TileTool;
    brush: TileBrush;
    solid: boolean;
    disabled: boolean;
    onBrushChange: (brush: TileBrush) => void;
    onSolidChange: (solid: boolean) => void;
};

// The panel on the right of the sheet, beside the tools (in the column that
// holds it), that shows up with the tools that paint: the category and whether it is solid, one over
// the other. They are the brush.
export const TileBrushRail = ({
    tool,
    brush,
    solid,
    disabled,
    onBrushChange,
    onSolidChange,
}: Props) => {
    return (
        <FloatingPanel
            open={usesBrush(tool)}
            className="static flex max-h-[calc(100vh-14rem)] flex-col items-center gap-1 overflow-y-auto p-1"
        >
            {TILE_CATEGORY_META.map((meta) => (
                <TileBrushButton
                    key={meta.value}
                    meta={meta}
                    active={brush === meta.value}
                    disabled={disabled}
                    onClick={() => onBrushChange(meta.value)}
                />
            ))}
            <div className="bg-border my-0.5 h-px w-6" />
            <TileSolidToggle
                solid={solid}
                disabled={disabled}
                onSolidChange={onSolidChange}
            />
        </FloatingPanel>
    );
};
