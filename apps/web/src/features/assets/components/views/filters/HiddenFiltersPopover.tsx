import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { ActiveFilterChip as Chip } from "../../../types/activeFilterChip";
import { ActiveFilterChip } from "./ActiveFilterChip";

type Props = {
    // The filters that did not fit in the row.
    hidden: Chip[];
    onRemove: (changes: Record<string, undefined>) => void;
};

// The "+N" that holds the filters that did not fit.
export const HiddenFiltersPopover = ({ hidden, onRemove }: Props) => {
    if (hidden.length === 0) return null;

    return (
        <Popover>
            <PopoverTrigger className="text-muted-foreground inline-flex h-7 shrink-0 items-center rounded-md border px-2.5 text-sm font-semibold">
                +{hidden.length}
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="flex w-auto max-w-[min(28rem,var(--available-width))] flex-wrap items-center gap-2 p-3"
            >
                {hidden.map((chip) => (
                    <ActiveFilterChip
                        key={chip.field}
                        chip={chip}
                        onRemove={() => onRemove({ [chip.field]: undefined })}
                    />
                ))}
            </PopoverContent>
        </Popover>
    );
};
