import { cn } from "@/lib/utils";
import type { ExtractedGroup } from "../../../types/extractedInfo";
import { ExtractedRowItem } from "./ExtractedRowItem";

type Props = {
    groups: ExtractedGroup[];
    // Everything on one line and loose, with no box around, to fit the narrow
    // panel of an editor.
    compact?: boolean;
};

// Read-only list of what was taken from the image or worked out from the
// other fields. Each row has an icon and a color, and the groups are
// separated, so it reads at a glance.
export const ExtractedInfo = ({ groups, compact = false }: Props) => (
    <div
        className={cn(
            "flex flex-col",
            compact ? "gap-4" : "bg-muted/30 divide-y rounded-lg border"
        )}
    >
        {groups.map(({ title, rows }, index) => (
            <section
                key={title ?? index}
                className={cn("flex flex-col gap-2", !compact && "p-3")}
            >
                <ExtractedTitle title={title} />
                <dl className="flex flex-col gap-2">
                    {rows.map((row) => (
                        <ExtractedRowItem
                            key={row.label}
                            row={row}
                            compact={compact}
                        />
                    ))}
                </dl>
            </section>
        ))}
    </div>
);

const ExtractedTitle = ({ title }: { title?: string }) => {
    if (!title) return null;

    return (
        <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {title}
        </h4>
    );
};
