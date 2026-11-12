import { AVAILABILITIES, type Availability } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { USER_STATUS_LABELS } from "../../consts/user-status";

type Props = {
    availability: Availability;
    // Size, position and the ring that matches the surface it sits on.
    className?: string;
};

const DOT_COLORS: Record<Availability, string> = {
    [AVAILABILITIES.ACTIVE]: "bg-emerald-500",
    [AVAILABILITIES.AWAY]: "bg-zinc-400",
    [AVAILABILITIES.BUSY]: "bg-amber-500",
};

/** The dot of an availability: green active, grey away, amber busy. */
export const StatusDot = ({ availability, className }: Props) => (
    <span
        role="img"
        aria-label={USER_STATUS_LABELS[availability]}
        className={cn(
            "inline-block shrink-0 rounded-full",
            DOT_COLORS[availability],
            className
        )}
    />
);
