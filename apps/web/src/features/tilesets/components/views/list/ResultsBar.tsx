import type { UseFormReturn } from "react-hook-form";
import { formatLabel } from "@/utils/text";
import { ActiveFiltersRow } from "@/features/assets/components/views/filters/ActiveFiltersRow";
import type { ActiveFilterChip } from "@/features/assets/types/activeFilterChip";
import type { TilesetFilters } from "../../../types/filters";
import type { TilesetSearchFormValues } from "../../../types/searchForm";
import { TilesetSearchField } from "./SearchField";

type Props = {
    total: number;
    searchForm: UseFormReturn<TilesetSearchFormValues>;
    chips: ActiveFilterChip[];
    onRemoveFilter: (changes: TilesetFilters) => void;
};

// Above the grid: how many tilesets the request returned, the search, and the
// filters in use on the right.
export const TilesetResultsBar = ({
    total,
    searchForm,
    chips,
    onRemoveFilter,
}: Props) => (
    <div className="flex shrink-0 items-center justify-between gap-4 px-6 pt-4 pb-2">
        <span className="text-muted-foreground flex h-7 shrink-0 items-center text-sm">
            {formatLabel(total, "", {
                singular: "tileset",
                plural: "tilesets",
            })}
        </span>
        <TilesetSearchField form={searchForm} />
        <ActiveFiltersRow chips={chips} onRemove={onRemoveFilter} />
    </div>
);
