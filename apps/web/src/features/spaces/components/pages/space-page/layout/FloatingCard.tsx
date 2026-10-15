import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children?: ReactNode; className?: string };

// The surface of a card that floats over the space, like the profile card.
export const FloatingCard = ({ children, className }: Props) => {
    return (
        <div
            className={cn(
                "pointer-events-auto rounded-2xl bg-popover p-2 text-popover-foreground shadow-2xl ring-1 ring-foreground/10",
                className
            )}
        >
            {children}
        </div>
    );
};
