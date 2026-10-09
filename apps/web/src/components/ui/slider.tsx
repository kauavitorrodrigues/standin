import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({ className, ...props }: SliderPrimitive.Root.Props) {
    return (
        <SliderPrimitive.Root
            data-slot="slider"
            className={cn("w-full", className)}
            {...props}
        >
            <SliderPrimitive.Control className="flex h-5 w-full touch-none items-center select-none">
                <SliderPrimitive.Track className="h-1.5 w-full rounded-full bg-foreground/15">
                    <SliderPrimitive.Indicator className="rounded-full bg-primary" />
                    <SliderPrimitive.Thumb className="size-4 rounded-full border border-primary bg-background shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </SliderPrimitive.Track>
            </SliderPrimitive.Control>
        </SliderPrimitive.Root>
    );
}

export { Slider };
