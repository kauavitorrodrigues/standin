import { formatLabel } from "@/utils/text";
import { ActiveFiltersRow } from "@/features/assets/components/views/filters/ActiveFiltersRow";
import type { ActiveFilterChip } from "@/features/assets/types/activeFilterChip";

type Props = {
    total: number;
    chips: ActiveFilterChip[];
    onRemoveFilter: (changes: Record<string, undefined>) => void;
};

// Above the grid: how many items the request returned, and the filters in
// use on the right.
export const ResultsBar = ({ total, chips, onRemoveFilter }: Props) => (
    <div className="flex shrink-0 items-center justify-between gap-4 px-6 pt-4 pb-2">
        <span className="text-muted-foreground flex h-7 shrink-0 items-center text-sm">
            {formatLabel(total, "", { singular: "item", plural: "itens" })}
        </span>
        <ActiveFiltersRow chips={chips} onRemove={onRemoveFilter} />
    </div>
);
