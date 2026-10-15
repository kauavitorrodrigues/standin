import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
    open: boolean;
    children: ReactNode;
    className?: string;
};

// Holds content that appears and disappears with a smooth height and fade.
// Closed, the content stays mounted (so a form field inside keeps its value)
// but is inert and hidden from assistive tech, with no tab stops. It reads
// data-state="open" or "closed" so the caller can adjust spacing around it.
function AnimatedCollapse({ open, children, className }: Props) {
    return (
        <div
            data-slot="animated-collapse"
            data-state={open ? "open" : "closed"}
            inert={!open}
            aria-hidden={!open}
            className={cn(
                "grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out motion-reduce:transition-none",
                "grid-rows-[1fr] opacity-100 data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0",
                className
            )}
        >
            <div className="min-h-0 overflow-hidden">{children}</div>
        </div>
    );
}

export { AnimatedCollapse };
