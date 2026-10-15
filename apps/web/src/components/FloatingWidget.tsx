import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FloatingWidgetProps = {
    children?: ReactNode;
    className?: string;
};

// Glass surface for the small widgets that float over the space, like the
// view switcher and the room name. It opts back into pointer events because
// its docking wrapper lets them through to the canvas.
export const FloatingWidget = ({
    children,
    className,
}: FloatingWidgetProps) => (
    <div
        className={cn(
            "pointer-events-auto flex items-center gap-0.5 rounded-lg bg-background/40 p-0.5 ring-1 ring-foreground/10 backdrop-blur-md",
            className
        )}
    >
        {children}
    </div>
);
