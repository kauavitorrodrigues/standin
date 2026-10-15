import type { ReactNode } from "react";
import { FloatingPanel } from "@/features/editor/components/layout/FloatingPanel";

type Props = {
    children: ReactNode;
};

// The tools of an editor floating on the right of the canvas, one over the
// other. It is centered from top to bottom, keeps clear of the zoom, and
// scrolls if the editor is too short.
export const VerticalToolbar = ({ children }: Props) => (
    <FloatingPanel className="inset-y-0 right-3 my-auto flex h-fit max-h-[calc(100%-6.5rem)] flex-col items-center gap-1 overflow-y-auto p-1">
        {children}
    </FloatingPanel>
);
