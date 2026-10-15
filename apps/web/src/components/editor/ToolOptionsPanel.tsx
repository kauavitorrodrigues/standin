import type { ReactNode } from "react";
import { FloatingPanel } from "@/components/editor/FloatingPanel";

type Props = {
    // Whether it is shown: only the tools it belongs to show it.
    open: boolean;
    children: ReactNode;
};

// A panel of the options of a tool, in the column that opens beside the
// toolbar (see `ToolOptionsAnchor`). The buttons go one over the other.
export const ToolOptionsPanel = ({ open, children }: Props) => (
    <FloatingPanel
        open={open}
        className="static flex max-h-[calc(100vh-14rem)] flex-col items-center gap-1 overflow-y-auto p-1"
    >
        {children}
    </FloatingPanel>
);
