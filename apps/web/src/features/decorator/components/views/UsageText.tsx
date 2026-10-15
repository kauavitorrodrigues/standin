import type { UsageLevel } from "@/features/editor/types/usage-level";

type UsageTextProps = {
    percent: number;
    level: UsageLevel;
};

// The share of the object limit that is used. The label is soft and the value
// is strong, and red from the warning level on.
export const UsageText = ({ percent, level }: UsageTextProps) => (
    <span
        data-level={level}
        aria-label="Objetos usados"
        className="group text-sm"
    >
        <span className="text-muted-foreground">Objetos usados: </span>
        <span className="text-foreground group-data-[level=full]:text-destructive group-data-[level=warning]:text-destructive">
            {percent}%
        </span>
    </span>
);
