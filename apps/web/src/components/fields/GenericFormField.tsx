import type { ReactNode } from "react";
import {
    Controller,
    type Control,
    type ControllerFieldState,
    type ControllerRenderProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type GenericFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = {
    control: Control<TFieldValues>;
    name: TName;
    label?: string;
    required?: boolean;
    className?: string;
    render: (
        field: ControllerRenderProps<TFieldValues, TName>,
        fieldState: ControllerFieldState,
    ) => ReactNode;
};

export function GenericFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    required,
    className,
    render,
}: GenericFormFieldProps<TFieldValues, TName>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field
                    data-invalid={fieldState.invalid}
                    className={cn(className)}
                >
                    {label && (
                        <FieldLabel htmlFor={name}>
                            {label} {required && <span aria-hidden>*</span>}
                        </FieldLabel>
                    )}
                    {render(field, fieldState)}
                    <FieldError
                        errors={fieldState.error ? [fieldState.error] : []}
                    />
                </Field>
            )}
        />
    );
}
