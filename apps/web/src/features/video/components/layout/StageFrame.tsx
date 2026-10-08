import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebarInsetClass } from "../../hooks/useSidebarInsetClass";

// Docked to the top of the canvas, like the strip in Gather or SoWork. It
// never captures pointer events itself (the tiles opt back in), so the map
// underneath stays clickable and draggable around the videos.
export const StageFrame = ({ children }: { children: ReactNode }) => (
    <div
        className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 flex flex-col items-center gap-2 p-3",
            useSidebarInsetClass()
        )}
    >
        {children}
    </div>
);
