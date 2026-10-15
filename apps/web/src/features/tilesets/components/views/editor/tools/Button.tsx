import { getToolVariant } from "@/features/assets/utils/getToggleVariant";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TileToolMeta } from "../../../../types/sheet";

type Props = {
    meta: TileToolMeta;
    active: boolean;
    onClick: () => void;
};

// One tool of the toolbar: only its icon, with the name, what it does and its
// key in the tooltip.
export const TileToolButton = ({ meta, active, onClick }: Props) => {
    const { label, description, icon: Icon, shortcut } = meta;

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="icon"
                        variant={getToolVariant(active)}
                        aria-label={label}
                        aria-pressed={active}
                        onClick={onClick}
                    />
                }
            >
                <Icon />
            </TooltipTrigger>
            <TooltipContent side="left" shortcut={shortcut}>
                <span className="flex flex-col">
                    <span className="font-medium">{label}</span>
                    <span className="text-white/70">{description}</span>
                </span>
            </TooltipContent>
        </Tooltip>
    );
};
