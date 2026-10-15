import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };
export const Content = ({ children, className }: Props) => {
    return (
        <div className={cn("flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6", className)}>
            {children}
        </div>
    );
};
