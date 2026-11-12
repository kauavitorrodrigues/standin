import { AVAILABILITIES, type Availability } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { StatusDot } from "./StatusDot";

type OnlineDotProps = {
    isOnline: boolean;
    // The color of the dot. Green when the person is available.
    availability?: Availability;
    // Size and the ring that matches the surface the avatar sits on.
    className?: string;
};

export const OnlineDot = ({
    isOnline,
    availability = AVAILABILITIES.ACTIVE,
    className,
}: OnlineDotProps) => {
    if (!isOnline) return null;

    return (
        <StatusDot
            availability={availability}
            className={cn("absolute right-0 bottom-0 ring-2", className)}
        />
    );
};
