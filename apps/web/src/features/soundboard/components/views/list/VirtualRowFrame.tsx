import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    start: number;
    height: number;
    // Its group is folded: it fades out, takes no height and is inert.
    collapsed: boolean;
    children: ReactNode;
};

// One row of the virtual list, put where it belongs by its offset. Its offset,
// its height and its opacity move with the same easing as the card rows, so a
// group that folds slides what is below it up instead of dropping its rows.
export const VirtualRowFrame = ({
    start,
    height,
    collapsed,
    children,
}: Props) => (
    <div
        inert={collapsed}
        aria-hidden={collapsed}
        className={cn(
            "absolute top-0 left-0 w-full overflow-hidden transition-[transform,height,opacity] duration-200 ease-out motion-reduce:transition-none",
            collapsed && "opacity-0"
        )}
        style={{ height, transform: `translateY(${start}px)` }}
    >
        {children}
    </div>
);
