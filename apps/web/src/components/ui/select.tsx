import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Select<Value, Multiple extends boolean | undefined = false>(
    props: SelectPrimitive.Root.Props<Value, Multiple>
) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
    className,
    children,
    ...props
}: SelectPrimitive.Trigger.Props) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            className={cn(
                "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-foreground/5",
                className
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon>
                <ChevronDownIcon className="size-4 text-muted-foreground" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectValue(props: SelectPrimitive.Value.Props) {
    return (
        <SelectPrimitive.Value
            data-slot="select-value"
            className="truncate"
            {...props}
        />
    );
}

function SelectContent({
    className,
    children,
    ...props
}: SelectPrimitive.Popup.Props) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Positioner
                className="isolate z-50 outline-none"
                sideOffset={4}
                alignItemWithTrigger={false}
            >
                <SelectPrimitive.Popup
                    data-slot="select-content"
                    className={cn(
                        "max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
                        className
                    )}
                    {...props}
                >
                    <SelectPrimitive.List>{children}</SelectPrimitive.List>
                </SelectPrimitive.Popup>
            </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
    );
}

function SelectItem({
    className,
    children,
    ...props
}: SelectPrimitive.Item.Props) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                "relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-foreground/10 data-disabled:opacity-50",
                className
            )}
            {...props}
        >
            <SelectPrimitive.ItemText className="truncate">
                {children}
            </SelectPrimitive.ItemText>
            <SelectPrimitive.ItemIndicator className="absolute right-2">
                <CheckIcon className="size-4" />
            </SelectPrimitive.ItemIndicator>
        </SelectPrimitive.Item>
    );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
