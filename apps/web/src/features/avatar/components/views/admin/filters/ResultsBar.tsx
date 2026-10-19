import { formatLabel } from "@/utils/text";
import type { ActiveFilterChip } from "../../../../types/admin/activeFilterChip";
import { ActiveFiltersRow } from "./ActiveFiltersRow";

type Props = {
    total: number;
    label: { singular: string; plural: string };
    chips: ActiveFilterChip[];
    onRemoveFilter: (changes: Record<string, undefined>) => void;
};

// Above the grid: how many rows the filters left, and those filters on the
// right.
export const ResultsBar = ({ total, label, chips, onRemoveFilter }: Props) => (
    <div className="flex shrink-0 items-center justify-between gap-4 px-6 pt-4 pb-2">
        <span className="text-muted-foreground flex h-7 shrink-0 items-center text-sm">
            {formatLabel(total, "", label)}
        </span>
        <ActiveFiltersRow chips={chips} onRemove={onRemoveFilter} />
    </div>
);
