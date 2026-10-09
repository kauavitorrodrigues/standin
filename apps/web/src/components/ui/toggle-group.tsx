import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";

import { cn } from "@/lib/utils";

function ToggleGroup({ className, ...props }: ToggleGroupPrimitive.Props) {
    return (
        <ToggleGroupPrimitive
            data-slot="toggle-group"
            className={cn("flex items-center gap-0.5", className)}
            {...props}
        />
    );
}

function ToggleGroupItem({ className, ...props }: TogglePrimitive.Props) {
    return (
        <TogglePrimitive
            data-slot="toggle-group-item"
            className={cn(
                "inline-flex shrink-0 items-center justify-center text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-foreground/15 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className
            )}
            {...props}
        />
    );
}

export { ToggleGroup, ToggleGroupItem };
