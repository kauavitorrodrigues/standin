import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
    icon: LucideIcon;
    label: string;
    selected: boolean;
    disabled?: boolean;
    onSelect: () => void;
};

// One floating icon of a carousel strip, with its name in the tooltip.
export const CarouselIconItem = ({
    icon: Icon,
    label,
    selected,
    disabled = false,
    onSelect,
}: Props) => (
    <CarouselItem className="basis-auto pl-1">
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={label}
                        aria-pressed={selected}
                        disabled={disabled}
                        onClick={onSelect}
                        className="aria-pressed:bg-muted aria-pressed:text-foreground text-muted-foreground"
                    />
                }
            >
                <Icon />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    </CarouselItem>
);
