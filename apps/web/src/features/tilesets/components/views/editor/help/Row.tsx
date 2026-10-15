import type { ReactNode } from "react";

type Props = {
    // The keys, or the way of using the mouse, that do it.
    keys: ReactNode;
    children: ReactNode;
};

// One line of the help: what does it, and what it does.
export const TileHelpRow = ({ keys, children }: Props) => (
    <li className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted-foreground">{children}</span>
        <span className="flex shrink-0 items-center gap-1">{keys}</span>
    </li>
);
