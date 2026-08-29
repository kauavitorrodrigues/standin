import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };
export const Content = ({ children, className }: Props) => {
    return <div className={cn("flex-1 flex gap-6 flex-col p-6", className)}>{children}</div>;
};
