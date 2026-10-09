import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { RAIL_WIDTH_CSS_VALUE } from "@/features/spaces/consts/rail";

type Props = { children?: ReactNode; className?: string };
export const Body = ({ children, className }: Props) => {
    return (
        <div
            className={cn(
                "relative flex min-h-0 w-full flex-1 overflow-hidden",
                className
            )}
            style={
                {
                    "--rail-width": RAIL_WIDTH_CSS_VALUE,
                } as React.CSSProperties
            }
        >
            {children}
        </div>
    );
};
