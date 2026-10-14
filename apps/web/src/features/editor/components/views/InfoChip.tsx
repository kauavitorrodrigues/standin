import type { ReactNode } from "react";
import { FloatingPanel } from "@/features/editor/components/layout/FloatingPanel";

type Props = {
    children: ReactNode;
};

// A line of text floating on the bottom left of the editor, for what is under
// the pointer or selected. The one that renders it decides when there is
// something to say.
export const InfoChip = ({ children }: Props) => (
    <FloatingPanel className="text-muted-foreground bottom-3 left-3 flex max-w-[calc(100%-10rem)] items-center gap-3 px-3 py-1.5 text-xs">
        {children}
    </FloatingPanel>
);
