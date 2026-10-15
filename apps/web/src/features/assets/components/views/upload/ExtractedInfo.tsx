import type { ExtractedGroup } from "../../../types/extractedInfo";
import { ExtractedRowItem } from "./ExtractedRowItem";

type Props = {
    groups: ExtractedGroup[];
    // Narrower labels, to leave the values more room beside an editor.
    compact?: boolean;
};

// Read-only list of what was taken from the image or worked out from the
// other fields. Each row has an icon and a color, and the groups are
// separated, so it reads at a glance.
export const ExtractedInfo = ({ groups, compact = false }: Props) => (
    <div className="bg-muted/30 flex flex-col divide-y rounded-lg border">
        {groups.map(({ title, rows }) => (
            <section key={title} className="flex flex-col gap-2 p-3">
                <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {title}
                </h4>
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
