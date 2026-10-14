import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    TOOLBAR_ANCHOR_ATTRIBUTE,
    TOOLBAR_TINT_PERCENT,
} from "@/components/editor/consts/toolbar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    getToggleVariant,
    getToolVariant,
} from "@/features/assets/utils/getToggleVariant";

type Props = {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    // What it does, under the name in the tooltip.
    description?: string;
    // The key that does the same, as shown to the user.
    shortcut?: string;
    disabled?: boolean;
    // Set for a button that is on or off. Leave out for a plain action.
    active?: boolean;
    // How the button looks while on: filled with the main color (a tool in use)
    // or soft (a switch).
    activeLook?: "tool" | "toggle";
    // A color of its own (a category): the icon has it, and the button is
    // tinted with it while on, instead of the look of `activeLook`.
    color?: string;
    // Names the button for what opens beside it (see `ToolOptionsAnchor`).
    anchorId?: string;
    // Where the tooltip opens, away from the edge the button sits on.
    side?: "top" | "bottom" | "left" | "right";
    // The gap in px between the button and the tooltip. Leave out for the default.
    sideOffset?: number;
};

const ToolbarDescription = ({ description }: { description?: string }) => {
    if (!description) return null;

    return <span className="text-white/70">{description}</span>;
};

const getVariant = ({
    activeLook,
    on,
    color,
}: {
    activeLook: "tool" | "toggle";
    on: boolean;
    color?: string;
}) => {
    if (color) return "ghost";
    if (activeLook === "tool") return getToolVariant(on);
    return getToggleVariant(on);
};

const getTint = (color: string | undefined, on: boolean) => {
    if (!color || !on) return undefined;
    return `color-mix(in srgb, ${color} ${TOOLBAR_TINT_PERCENT}%, transparent)`;
};

// A button of an editor toolbar with only an icon. The name, what it does and
// its key are in the tooltip.
export const ToolbarButton = ({
    label,
    icon: Icon,
    onClick,
    description,
    shortcut,
    disabled = false,
    active,
    activeLook = "tool",
    color,
    anchorId,
    side = "left",
    sideOffset,
}: Props) => {
    const on = active ?? false;
    const variant = getVariant({ activeLook, on, color });

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="icon"
                        variant={variant}
                        aria-label={label}
                        aria-pressed={active}
                        disabled={disabled}
                        style={{ backgroundColor: getTint(color, on) }}
                        {...{ [TOOLBAR_ANCHOR_ATTRIBUTE]: anchorId }}
                        onClick={onClick}
                    />
                }
            >
                <Icon style={{ color }} />
            </TooltipTrigger>
            <TooltipContent
                side={side}
                sideOffset={sideOffset}
                shortcut={shortcut}
            >
                <span className="flex flex-col">
                    <span className="font-medium">{label}</span>
                    <ToolbarDescription description={description} />
                </span>
            </TooltipContent>
        </Tooltip>
    );
};
