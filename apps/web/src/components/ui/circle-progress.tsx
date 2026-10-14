import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type CircleProgressProps = {
    // 0 to 100.
    value: number;
    // What goes inside the ring, like the percent.
    children?: ReactNode;
    className?: string;
    indicatorClassName?: string;
    "aria-label"?: string;
};

// A ring that fills clockwise from the top. The size comes from className, so
// the content inside has room for up to "100%".
export const CircleProgress = ({
    value,
    children,
    className,
    indicatorClassName,
    "aria-label": ariaLabel,
}: CircleProgressProps) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
        <div
            role="progressbar"
            aria-label={ariaLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
            className={cn("relative size-11 shrink-0", className)}
        >
            <svg viewBox="0 0 40 40" className="size-full -rotate-90">
                <circle
                    cx="20"
                    cy="20"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="3"
                    className="stroke-muted"
                />
                <circle
                    cx="20"
                    cy="20"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
                    className={cn(
                        "stroke-primary transition-[stroke-dashoffset]",
                        indicatorClassName
                    )}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums">
                {children}
            </span>
        </div>
    );
};
