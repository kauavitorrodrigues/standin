import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type Props = {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
};
export const Content = ({ children, className, style }: Props) => {
    return (
        <div
            className={cn(
                "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                className
            )}
            style={style}
        >
            {children}
        </div>
    );
};
