import type { FieldPath, FieldValues } from "react-hook-form";
import type { MetaItem } from "@/types/meta";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";

// An option may carry an icon and a color (see `MetaItem`), shown on the item
// and on the selected value.
type Option = { value: string } & Pick<MetaItem, "label"> &
    Partial<Pick<MetaItem, "icon" | "color">>;

const OptionLabel = ({ option }: { option: Option }) => {
    const Icon = option.icon;
    return (
        <span className="flex items-center gap-2">
            {Icon && (
                <Icon className="size-4" style={{ color: option.color }} />
            )}
            {option.label}
        </span>
    );
};

type SelectFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
};

export function SelectFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    options,
    placeholder,
    disabled,
    ...fieldProps
}: SelectFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            {...fieldProps}
            render={(field) => (
                <Select
                    value={field.value}
                    onValueChange={(next) => {
                        if (next !== null) field.onChange(next);
                    }}
                    disabled={disabled}
                >
                    <SelectTrigger id={fieldProps.name} className="w-full">
                        <SelectValue placeholder={placeholder}>
                            {(selected: string | null) => {
                                const option = options.find(
                                    (item) => item.value === selected
                                );
                                return option ? (
                                    <OptionLabel option={option} />
                                ) : (
                                    <span className="text-muted-foreground">
                                        {placeholder}
                                    </span>
                                );
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
            )}
        />
    );
}
