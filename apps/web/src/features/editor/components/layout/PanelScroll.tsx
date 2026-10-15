import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
    children: ReactNode;
};

// The part of a side panel that scrolls, under what stays fixed at the top.
// It takes the height that is left, and has the padding of the panel.
export const PanelScroll = ({ children }: Props) => (
    <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">{children}</div>
    </ScrollArea>
);
