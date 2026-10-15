import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };
export const Root = ({ children, className }: Props) => {
    return (
        <div className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
            {children}
        </div>
    );
};
