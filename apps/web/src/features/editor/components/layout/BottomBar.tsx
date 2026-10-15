import type { ReactNode } from "react";
import { FloatingPanel } from "@/features/editor/components/layout/FloatingPanel";

type Props = {
    // Whether the side panel is open, to center the bar in the room it leaves.
    panelOpen: boolean;
    children: ReactNode;
};

// The actions of an editor (discard, the state, save or publish), floating on
// the bottom of the canvas, centered in the room the side panel leaves.
export const BottomBar = ({ panelOpen, children }: Props) => (
    <div
        data-panel-open={panelOpen}
        className="pointer-events-none absolute inset-x-0 bottom-3 h-12 data-[panel-open=true]:left-[calc(18rem+1.5rem)]"
    >
        <FloatingPanel className="inset-x-0 bottom-0 mx-auto flex w-fit items-center gap-1.5 p-1">
            {children}
        </FloatingPanel>
    </div>
);
