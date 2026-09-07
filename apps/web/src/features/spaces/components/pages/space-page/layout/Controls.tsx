import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children?: ReactNode; className?: string };
export const Controls = ({ children, className }: Props) => {
    return (
        <div
            className={cn(
                "flex w-full shrink-0 items-center justify-between gap-2 border-t border-border p-4",
                className
            )}
        >
            {children}
        </div>
    );
};
