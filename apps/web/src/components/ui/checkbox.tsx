import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                "peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-transparent outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:bg-input/30",
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current"
                render={(indicatorProps, state) => (
                    <span {...indicatorProps}>
                        {state.indeterminate ? (
                            <MinusIcon className="size-3" />
                        ) : (
                            <CheckIcon className="size-3" />
                        )}
                    </span>
                )}
            />
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
