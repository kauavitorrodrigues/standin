import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    // Where it floats over the editor, and how it lays out what is inside.
    className?: string;
    // Whether it is shown. It fades and slides in and out instead of
    // appearing and disappearing, and it cannot be reached while it is out.
    open?: boolean;
    children: ReactNode;
};

// A panel that floats over the editor, like the ones of Figma: it takes no
// room of its own, so the sheet gets all the area.
export const FloatingPanel = ({ className, open = true, children }: Props) => (
    <div
        data-open={open}
        inert={!open}
        className={cn(
            "bg-background/90 pointer-events-auto absolute z-99 rounded-lg border shadow-sm backdrop-blur transition-[opacity,translate] duration-150 ease-out data-[open=false]:pointer-events-none data-[open=false]:translate-x-2 data-[open=false]:opacity-0",
            className
        )}
    >
        {children}
    </div>
);
