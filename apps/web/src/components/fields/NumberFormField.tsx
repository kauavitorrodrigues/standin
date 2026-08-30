import type { FieldPath, FieldValues } from "react-hook-form";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";
import { NumberField } from "./NumberField";

type NumberFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
};

export function NumberFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    placeholder,
    disabled,
    min,
    max,
    ...fieldProps
}: NumberFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            {...fieldProps}
            render={(field) => (
                <NumberField
                    id={fieldProps.name}
                    name={field.name}
                    placeholder={placeholder}
                    disabled={disabled}
                    min={min}
                    max={max}
                    value={field.value}
                    onChange={field.onChange}
                />
            )}
        />
    );
}
