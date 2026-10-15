import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { cn } from "@/lib/utils";

function Progress({
    className,
    indicatorClassName,
    value,
    ...props
}: ProgressPrimitive.Root.Props & {
    indicatorClassName?: string;
}) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            value={value}
            min={0}
            max={100}
            className={cn("flex w-full", className)}
            {...props}
        >
            <ProgressPrimitive.Track
                data-slot="progress-track"
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
            >
                <ProgressPrimitive.Indicator
                    data-slot="progress-indicator"
                    className={cn(
                        "h-full rounded-full bg-primary transition-all",
                        indicatorClassName
                    )}
                />
            </ProgressPrimitive.Track>
        </ProgressPrimitive.Root>
    );
}

export { Progress };
