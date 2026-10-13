import type { FieldPath, FieldValues } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";

type TextareaFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
};

export function TextareaFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    placeholder,
    disabled,
    rows,
    ...fieldProps
}: TextareaFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            {...fieldProps}
            render={(field) => (
                <Textarea
                    {...field}
                    id={fieldProps.name}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    value={field.value ?? ""}
                />
            )}
        />
    );
}
