import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
    children?: ReactNode;
    className?: string;
    // False while the card fades away. A card that is simply unmounted when
    // it closes never needs it.
    isOpen?: boolean;
};

// The surface of a card that floats over the space, like the profile card. It
// fades in while rising a little, and out the same way.
export const FloatingCard = ({ children, className, isOpen = true }: Props) => {
    return (
        <div
            data-state={isOpen ? "open" : "closed"}
            className={cn(
                "pointer-events-auto animate-in rounded-2xl bg-popover p-2 text-popover-foreground shadow-2xl ring-1 ring-foreground/10 duration-150 ease-out fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none",
                "data-[state=closed]:pointer-events-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2",
                className
            )}
        >
            {children}
        </div>
    );
};
