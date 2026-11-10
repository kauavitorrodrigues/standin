import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
    children: ReactNode;
};

// The part of an app dialog that scrolls, with the scroll bar of the app. The
// dialog only has a max height, so a percentage height on the viewport would
// not resolve and a long step would spill over the footer. The viewport takes
// the room as a flex item instead.
export const AppDialogBody = ({ children }: Props) => (
    <ScrollArea
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        viewportClassName="min-h-0 flex-1"
    >
        <div className="flex flex-col gap-5 p-5">{children}</div>
    </ScrollArea>
);
