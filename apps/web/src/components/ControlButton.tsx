import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The square tinted button of the floating control bars. Anything that
// needs another look passes a className, which wins over the base one.
export const ControlButton = ({ className, ...props }: ButtonProps) => (
    <Button
        variant="ghost"
        size="icon-lg"
        className={cn(
            "size-9 rounded-xl bg-foreground/10 text-foreground hover:bg-foreground/15 dark:hover:bg-foreground/15 aria-expanded:bg-foreground/15 [&_svg:not([class*='size-'])]:size-4",
            className
        )}
        {...props}
    />
);
