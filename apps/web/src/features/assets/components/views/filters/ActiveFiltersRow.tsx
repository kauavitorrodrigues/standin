import { useVisibleItemsCount } from "@/hooks/useVisibleItemsCount";
import { ActiveFilterChip } from "@/features/assets/components/views/filters/ActiveFilterChip";
import { HiddenFiltersPopover } from "@/features/assets/components/views/filters/HiddenFiltersPopover";
import type { ActiveFilterChip as Chip } from "@/features/assets/types/activeFilterChip";

type Props = {
    chips: Chip[];
    onRemove: (changes: Record<string, undefined>) => void;
};

const moreClassName =
    "text-muted-foreground inline-flex h-7 shrink-0 items-center rounded-md border px-2.5 text-sm font-semibold";

// The filters in use, stuck to the right. What does not fit in the row goes
// to a "+N" popover.
export const ActiveFiltersRow = ({ chips, onRemove }: Props) => {
    const { containerRef, measureRef, visibleCount } = useVisibleItemsCount(
        chips.map(({ field }) => field).join(","),
        chips.length
    );
    const visible = chips.slice(0, visibleCount);
    const hidden = chips.slice(visibleCount);

    return (
        <div
            ref={containerRef}
            className="relative flex min-w-0 flex-1 items-center justify-end gap-2 overflow-hidden"
        >
            <HiddenFiltersPopover hidden={hidden} onRemove={onRemove} />
            {visible.map((chip) => (
                <ActiveFilterChip
                    key={chip.field}
                    chip={chip}
                    onRemove={() => onRemove({ [chip.field]: undefined })}
                />
            ))}
            <div
                ref={measureRef}
                aria-hidden
                className="pointer-events-none invisible fixed -top-96 left-0 flex gap-2"
            >
                {chips.map((chip) => (
                    <ActiveFilterChip key={chip.field} chip={chip} />
                ))}
                <span className={moreClassName}>+{chips.length}</span>
            </div>
        </div>
    );
};
