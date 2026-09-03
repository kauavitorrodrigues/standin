import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
    className?: string;
    ref?: Ref<HTMLDivElement>;
};

// Owns the visible chrome (border, background, focus ring) so the field
// inside it can render as plain, unstyled text. Exposes its ref so popovers
// anchored from inside it (e.g. the emoji picker) can position themselves
// against the whole frame instead of just their trigger button.
export const MessageComposerFrame = ({ children, className, ref }: Props) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col gap-2 rounded-2xl border border-input bg-background p-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            className
        )}
    >
        {children}
    </div>
);
