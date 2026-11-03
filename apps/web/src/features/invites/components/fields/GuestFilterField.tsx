import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GUEST_FILTERS } from "../../consts/guestFilters";
import type { GuestFilter, GuestFilterOption } from "../../types";

type Props = {
    value: GuestFilter;
    onChange: (filter: GuestFilter) => void;
};

const OptionLabel = ({ option }: { option: GuestFilterOption }) => (
    <span className="flex items-center gap-2">
        <option.icon className={`size-4 shrink-0 ${option.color}`} />
        {option.label}
    </span>
);

// A select that narrows the list of guests by state.
export const GuestFilterField = ({ value, onChange }: Props) => (
    <Select
        value={value}
        onValueChange={(next) => {
            if (next) onChange(next as GuestFilter);
        }}
    >
        <SelectTrigger
            aria-label="Filtrar convidados"
            className="w-36 shrink-0"
        >
            <SelectValue>
                {(selected: GuestFilter | null) => {
                    const option = GUEST_FILTERS.find(
                        (item) => item.value === selected
                    );
                    return option ? <OptionLabel option={option} /> : "";
                }}
            </SelectValue>
        </SelectTrigger>
        <SelectContent>
            {GUEST_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    <OptionLabel option={option} />
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
