import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { isPlaying: boolean; children: ReactNode };

// The frame of one clip. What is inside it shows on hover and on focus. The
// border is always there, transparent, so showing it never moves the content,
// and it is drawn inside the box so the padding of the list cannot clip it:
// the normal border on hover, the primary one while pressed or while this
// person plays the clip. The background never changes, only the border does.
export const ClipTileFrame = ({ isPlaying, children }: Props) => (
    <li
        className={cn(
            "group/tile relative flex h-full min-w-0 rounded-lg border border-transparent bg-foreground/10 hover:border-border active:border-primary",
            isPlaying && "border-primary hover:border-primary"
        )}
    >
        {children}
    </li>
);
