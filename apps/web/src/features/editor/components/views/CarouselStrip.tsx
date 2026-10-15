import type { ReactNode } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CAROUSEL_TOOLTIP_DELAY_MS } from "@/features/editor/consts/carousel";
import { cn } from "@/lib/utils";

type Props = {
    className?: string;
    // No band behind the icons, and the chevron at the start only shows when
    // there is something to scroll back to. The icons also show whole, never
    // one cut at the edge, so the viewport is a multiple of an icon's width.
    plain?: boolean;
    // The `CarouselItem`s of the strip.
    children: ReactNode;
};

// A band that sticks to the sides of the panel, with the items in the middle
// and a chevron on each end to scroll through them. Its own tooltip provider
// sets the delay, because the app-wide one is 0 and a provider delay of 0
// overrides the trigger's.
export const CarouselStrip = ({
    className,
    plain = false,
    children,
}: Props) => (
    <TooltipProvider delay={CAROUSEL_TOOLTIP_DELAY_MS}>
        <Carousel
            opts={{
                align: "start",
                dragFree: true,
                containScroll: "trimSnaps",
            }}
            className={cn(
                "bg-muted/40 -mx-3 flex items-center gap-1 border-y px-3 py-1",
                { "bg-transparent border-y-0": plain },
                className
            )}
        >
            <CarouselPrevious
                variant="ghost"
                size="icon-xs"
                className={cn("static inset-auto my-0 rounded-md", {
                    "disabled:hidden": plain,
                })}
            />
            <div className="min-w-0 flex-1 [container-type:inline-size]">
                <div
                    className={cn({
                        "w-[round(down,100cqw,2.25rem)]": plain,
                    })}
                >
                    <CarouselContent className="-ml-1">
                        {children}
                    </CarouselContent>
                </div>
            </div>
            <CarouselNext
                variant="ghost"
                size="icon-xs"
                className="static inset-auto my-0 rounded-md"
            />
        </Carousel>
    </TooltipProvider>
);
