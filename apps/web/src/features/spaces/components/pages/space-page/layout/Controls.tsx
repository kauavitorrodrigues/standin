import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { visible: boolean; children?: ReactNode; className?: string };

// Floats over the map instead of reserving a row under it. The wrapper lets
// pointer events through to the canvas; each ControlGroup opts back in.
export const Controls = ({ visible, children, className }: Props) => {
    if (!visible) return null;

    return (
        <div
            className={cn(
                "pointer-events-none absolute right-0 bottom-0 left-(--rail-width) z-30 flex items-end justify-center gap-4 px-4 pt-4 pb-2",
                className
            )}
        >
            {children}
        </div>
    );
};
