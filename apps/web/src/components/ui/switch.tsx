import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
    className,
    size = "default",
    ...props
}: SwitchPrimitive.Root.Props & { size?: "default" | "lg" }) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            data-size={size}
            className={cn(
                "group/switch peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-foreground/20 p-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-[size=lg]:h-7 data-[size=lg]:w-12 data-[size=lg]:p-1",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className="pointer-events-none block size-4 rounded-full bg-background shadow-sm transition-transform group-data-[size=lg]/switch:size-5 data-checked:translate-x-4 group-data-[size=lg]/switch:data-checked:translate-x-[18px]"
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
