import { cn } from "@/lib/utils";

type OnlineDotProps = {
    isOnline: boolean;
    // Size and the ring that matches the surface the avatar sits on.
    className?: string;
};

export const OnlineDot = ({ isOnline, className }: OnlineDotProps) => {
    if (!isOnline) return null;

    return (
        <span
            className={cn(
                "absolute right-0 bottom-0 rounded-full bg-emerald-500 ring-2",
                className
            )}
        />
    );
};
