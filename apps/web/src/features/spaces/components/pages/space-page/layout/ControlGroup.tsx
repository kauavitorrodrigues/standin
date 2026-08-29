import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children?: ReactNode; className?: string };
export const ControlGroup = ({ children, className }: Props) => {
    return (
        <div
            className={cn("flex items-center justify-center gap-2", className)}
        >
            {children}
        </div>
    );
};
