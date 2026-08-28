import type { FieldPath, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";

type TextFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    type?: "text" | "email" | "password";
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
};

export function TextFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    type = "text",
    placeholder,
    disabled,
    maxLength,
    ...fieldProps
}: TextFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            {...fieldProps}
            render={(field) => (
                <Input
                    {...field}
                    id={fieldProps.name}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    value={field.value ?? ""}
                />
            )}
        />
    );
}
