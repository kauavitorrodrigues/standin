import type { ActiveFilterChip as Chip } from "../../../../types/admin/activeFilterChip";
import { ActiveFilterChip } from "./ActiveFilterChip";

type Props = {
    chips: Chip[];
    onRemove: (changes: Record<string, undefined>) => void;
};

// The filters in use, stuck to the right.
export const ActiveFiltersRow = ({ chips, onRemove }: Props) => (
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
        {chips.map((chip) => (
            <ActiveFilterChip
                key={chip.field}
                chip={chip}
                onRemove={() => onRemove({ [chip.field]: undefined })}
            />
        ))}
    </div>
);
