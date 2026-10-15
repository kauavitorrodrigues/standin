import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TILE_ACTIVE_TINT_PERCENT } from "../../../../consts/sheetStyle";
import type { TileCategoryMeta } from "../../../../types/meta";

type Props = {
    meta: TileCategoryMeta;
    active: boolean;
    disabled: boolean;
    onClick: () => void;
};

// The one in use is tinted with its own color instead of outlined, which
// reads better on a dark editor.
const getActiveTint = (color: string, active: boolean) => {
    if (!active) return undefined;
    return `color-mix(in srgb, ${color} ${TILE_ACTIVE_TINT_PERCENT}%, transparent)`;
};

// One category as a brush: only its icon, in its color, with the name and its
// key in the tooltip. The colors are what tell the categories apart on the
// sheet, so they are what tells them apart here.
export const TileBrushButton = ({ meta, active, disabled, onClick }: Props) => {
    const { label, color, icon: Icon, shortcut } = meta;

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={label}
                        aria-pressed={active}
                        disabled={disabled}
                        style={{
                            backgroundColor: getActiveTint(color, active),
                        }}
                        onClick={onClick}
                    />
                }
            >
                <Icon style={{ color }} />
            </TooltipTrigger>
            <TooltipContent side="left" shortcut={shortcut}>
                {label}
            </TooltipContent>
        </Tooltip>
    );
};
