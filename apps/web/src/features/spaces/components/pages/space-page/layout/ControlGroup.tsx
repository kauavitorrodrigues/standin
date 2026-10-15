import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type Props = { children?: ReactNode; className?: string; shared?: boolean };

// Shared with the same group in the chat card: the browser morphs one into
// the other when the view changes (see index.css). Groups that only borrow the
// look must opt out, since a transition name has to be unique on the page.
const getTransitionStyle = (shared: boolean): CSSProperties | undefined => {
    if (!shared) return undefined;
    return { viewTransitionName: "space-controls" };
};

export const ControlGroup = ({ children, className, shared = true }: Props) => {
    return (
        <div
            style={getTransitionStyle(shared)}
            className={cn(
                "pointer-events-auto flex items-center justify-center gap-1 rounded-2xl bg-muted p-1.5 text-foreground",
                className
            )}
        >
            {children}
        </div>
    );
};
