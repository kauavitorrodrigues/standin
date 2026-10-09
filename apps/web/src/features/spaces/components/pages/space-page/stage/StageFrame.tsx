import type { ReactNode } from "react";

// Docked to the top of the canvas, like the strip in Gather or SoWork. It
// never captures pointer events itself (the tiles opt back in), so the map
// underneath stays clickable and draggable around the videos.
export const StageFrame = ({ children }: { children: ReactNode }) => (
    <div className="pointer-events-none absolute top-0 right-0 left-(--rail-width) z-10 flex flex-col items-center gap-2 p-3">
        {children}
    </div>
);
