import { ChevronDownIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ToolbarSection } from "@/features/editor/components/layout/ToolbarSection";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
    label: string;
    // What the button shows for the current choice (a thumbnail, a color).
    preview: ReactNode;
    // The choices, shown over the button.
    children: ReactNode;
    side?: "top" | "bottom";
    // The gap in px between the button and the popover.
    sideOffset?: number;
    // Called when the pointer or the focus reaches the button, before it is
    // opened, so what the popover shows can be fetched ahead.
    onPreload?: () => void;
    // The gap in px between the button and its tooltip.
    tooltipOffset?: number;
    contentClassName?: string;
};

// A button of a toolbar that shows the current choice beside a chevron and
// opens the list of choices in a popover. The chevron turns up while it is
// open. The model and the color of an object are both this.
export const PickerControl = ({
    label,
    preview,
    children,
    side = "top",
    sideOffset = 10,
    tooltipOffset,
    onPreload,
    contentClassName,
}: Props) => {
    const [open, setOpen] = useState(false);

    return (
        <ToolbarSection>
            <Popover open={open} onOpenChange={setOpen}>
                <Tooltip disabled={open}>
                    <TooltipTrigger
                        render={
                            <PopoverTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        aria-label={label}
                                        className="h-8 gap-1 px-1.5"
                                        onPointerEnter={onPreload}
                                        onFocus={onPreload}
                                    />
                                }
                            />
                        }
                    >
                        {preview}
                        <ChevronDownIcon className="text-muted-foreground size-3.5 transition-transform group-data-popup-open/button:rotate-180" />
                    </TooltipTrigger>
                    <TooltipContent side={side} sideOffset={tooltipOffset}>
                        {label}
                    </TooltipContent>
                </Tooltip>
                <PopoverContent
                    side={side}
                    sideOffset={sideOffset}
                    className={contentClassName}
                >
                    {children}
                </PopoverContent>
            </Popover>
        </ToolbarSection>
    );
};
