import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
    ariaLabel: string;
    options: Option<T>[];
    value: T;
    onValueChange: (value: T) => void;
};

// A select over a short, fixed list of choices.
export const SettingSelect = <T extends string>({
    ariaLabel,
    options,
    value,
    onValueChange,
}: Props<T>) => (
        <Select
            value={value}
            onValueChange={(next) => {
                if (next) onValueChange(next as T);
            }}
        >
            <SelectTrigger aria-label={ariaLabel} className="w-50">
                <SelectValue>
                    {(selected: T | null) =>
                        options.find((option) => option.value === selected)
                            ?.label ?? ""
                    }
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
