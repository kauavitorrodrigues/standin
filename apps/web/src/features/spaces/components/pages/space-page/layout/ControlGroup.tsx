import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children?: ReactNode; className?: string };
export const ControlGroup = ({ children, className }: Props) => {
    return (
        <div
            // Shared with the same group in the chat card: the browser morphs
            // one into the other when the view changes (see index.css).
            style={{ viewTransitionName: "space-controls" }}
            className={cn(
                "pointer-events-auto flex items-center justify-center gap-1 rounded-2xl bg-muted p-1.5 text-foreground",
                className
            )}
        >
            {children}
        </div>
    );
};
