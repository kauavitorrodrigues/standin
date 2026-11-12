import type { LucideIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Option<T extends string> = {
    value: T;
    label: string;
    icon?: LucideIcon;
};

const OptionLabel = <T extends string>({ option }: { option: Option<T> }) => {
    const Icon = option.icon;
    return (
        <span className="flex items-center gap-2">
            {Icon && <Icon className="size-4 shrink-0" />}
            {option.label}
        </span>
    );
};

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
                    {(selected: T | null) => {
                        const option = options.find(
                            (item) => item.value === selected
                        );
                        return option ? <OptionLabel option={option} /> : "";
                    }}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        <OptionLabel option={option} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
