import { CircleProgress } from "@/components/ui/circle-progress";
import { USAGE_LEVELS } from "@/features/maps/__shared__/consts/usage";
import type { UsageLevel } from "@/features/maps/__shared__/types/usage-level";

type UsageMeterProps = {
    percent: number;
    level: UsageLevel;
};

// The share of the object limit that is used, in a ring. Red from the warning
// level on.
export const UsageMeter = ({ percent, level }: UsageMeterProps) => {
    let indicatorClassName = "stroke-primary";
    switch (level) {
        case USAGE_LEVELS.WARNING:
        case USAGE_LEVELS.FULL:
            indicatorClassName = "stroke-destructive";
            break;
        default:
            break;
    }

    return (
        <div className="flex w-full items-center justify-between text-xs">
            <span className="text-muted-foreground">Objetos usados</span>
            <CircleProgress
                value={percent}
                aria-label="Objetos usados"
                indicatorClassName={indicatorClassName}
            >
                {percent}%
            </CircleProgress>
        </div>
    );
};
