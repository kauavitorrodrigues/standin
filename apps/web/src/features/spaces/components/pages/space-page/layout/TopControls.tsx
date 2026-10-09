import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { visible: boolean; children?: ReactNode; className?: string };

// Mirror of Controls, docked to the top right instead of the bottom center.
// The wrapper lets pointer events through to the canvas; each
// TopControlGroup opts back in.
export const TopControls = ({ visible, children, className }: Props) => {
    if (!visible) return null;

    return (
        <div
            className={cn(
                "pointer-events-none absolute top-0 right-0 left-(--rail-width) z-30 flex items-start justify-end p-3",
                className
            )}
        >
            {children}
        </div>
    );
};
