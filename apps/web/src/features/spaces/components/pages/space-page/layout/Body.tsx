import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children?: ReactNode; className?: string };
export const Body = ({ children, className }: Props) => {
    return (
        <div
            className={cn(
                "relative flex min-h-0 w-full flex-1 overflow-hidden",
                className,
            )}
        >
            {children}
        </div>
    );
};
