import type { ReactNode } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CAROUSEL_TOOLTIP_DELAY_MS } from "@/components/editor/consts/carousel";
import { cn } from "@/lib/utils";

type Props = {
    className?: string;
    // The `CarouselItem`s of the strip.
    children: ReactNode;
};

// A band that sticks to the sides of the panel, with the items in the middle
// and a chevron on each end to scroll through them. Its own tooltip provider
// sets the delay, because the app-wide one is 0 and a provider delay of 0
// overrides the trigger's.
export const CarouselStrip = ({ className, children }: Props) => (
    <TooltipProvider delay={CAROUSEL_TOOLTIP_DELAY_MS}>
        <Carousel
            opts={{
                align: "start",
                dragFree: true,
                containScroll: "trimSnaps",
            }}
            className={cn(
                "bg-muted/40 -mx-3 flex items-center gap-1 border-y px-3 py-1",
                className
            )}
        >
            <CarouselPrevious
                variant="ghost"
                size="icon-xs"
                className="static inset-auto my-0 rounded-md"
            />
            <CarouselContent className="-ml-1">{children}</CarouselContent>
            <CarouselNext
                variant="ghost"
                size="icon-xs"
                className="static inset-auto my-0 rounded-md"
            />
        </Carousel>
    </TooltipProvider>
);
