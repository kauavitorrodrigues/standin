import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };
export const Root = ({ children, className }: Props) => {
    return (
        <div className={cn("flex flex-col flex-1 gap-6", className)}>
            {children}
        </div>
    );
};
