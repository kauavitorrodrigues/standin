import { cn } from "@/lib/utils";

type CountBadgeProps = {
    count: number;
    max?: number;
    className?: string;
};

export const CountBadge = ({ count, max = 9, className }: CountBadgeProps) => {
    if (count <= 0) return null;
    return (
        <span
            className={cn(
                "flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold",
                className
            )}
        >
            {count > max ? `${max}+` : count}
        </span>
    );
};
