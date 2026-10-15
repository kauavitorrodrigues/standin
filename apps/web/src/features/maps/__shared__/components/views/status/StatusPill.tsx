import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusPillProps = {
    className?: string;
    children: ReactNode;
};

export const StatusPill = ({ className, children }: StatusPillProps) => (
    <span
        role="status"
        className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium whitespace-nowrap",
            className
        )}
    >
        {children}
    </span>
);
