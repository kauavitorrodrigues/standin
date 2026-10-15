import type { ReactNode } from "react";

type Props = {
    open: boolean;
    children: ReactNode;
};

// The side panel of an editor. It floats over the left of the canvas, so it
// takes no room of its own, and it has the same fill as the other floating
// panels. It opens and closes by scale and opacity, growing from its top left
// corner (where the button that opens it sits) in 150 ms with ease-out.
// Closed, it cannot be reached.
export const SidePanel = ({ open, children }: Props) => (
    <div
        data-open={open}
        inert={!open}
        className="bg-background/90 pointer-events-auto absolute top-3 bottom-3 left-3 z-99 flex w-72 origin-top-left flex-col overflow-hidden rounded-lg border shadow-sm backdrop-blur transition-[opacity,scale] duration-150 ease-out data-[open=false]:pointer-events-none data-[open=false]:scale-95 data-[open=false]:opacity-0"
    >
        {children}
    </div>
);
