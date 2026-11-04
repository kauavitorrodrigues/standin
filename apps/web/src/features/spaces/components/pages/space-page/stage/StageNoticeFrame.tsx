import type { ReactNode } from "react";

// Where the notice of the stage goes when there is no strip of videos to sit
// under: the top of the canvas, above the full view. Like the stage frame it
// lets pointer events through, the notice opts back in.
export const StageNoticeFrame = ({ children }: { children: ReactNode }) => (
    <div className="pointer-events-none absolute top-0 right-0 left-(--rail-width) z-30 flex justify-center p-3">
        {children}
    </div>
);
