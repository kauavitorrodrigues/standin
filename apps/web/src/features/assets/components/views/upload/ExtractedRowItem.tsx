import { cn } from "@/lib/utils";
import type { ExtractedRow } from "../../../types/extractedInfo";

type Props = {
    row: ExtractedRow;
    compact: boolean;
};

// One row of the info panel: an icon with the color of what it is about, the
// name, the value and, at the end, an action when there is one. Compact, it
// is all on one line: the name takes what it needs, and the value, at the
// right, is cut short instead of wrapping.
export const ExtractedRowItem = ({ row, compact }: Props) => {
    if (row.show === false) return null;
    const { label, value, icon: Icon, color, action } = row;

    return (
        <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")}>
            <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md"
                style={{
                    color,
                    backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                }}
            >
                <Icon className="size-4" />
            </span>
            <dt
                className={cn(
                    "text-muted-foreground shrink-0",
                    compact ? "text-xs" : "text-sm",
                    !compact && "w-32"
                )}
            >
                {label}
            </dt>
            <dd
                className={cn(
                    "min-w-0 flex-1 font-medium",
                    compact
                        ? "truncate text-right text-xs"
                        : "text-sm break-words"
                )}
            >
                {value}
            </dd>
            {action}
        </div>
    );
};
