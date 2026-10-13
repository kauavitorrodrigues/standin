import type { FieldPath, FieldValues } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";

type SwitchFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    disabled?: boolean;
    size?: "default" | "lg";
};

export function SwitchFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    disabled,
    size,
    ...fieldProps
}: SwitchFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            {...fieldProps}
            // The field stretches its direct children (`*:w-full`), so the
            // switch sits in a wrapper that takes the stretch instead.
            render={(field) => (
                <div>
                    <Switch
                        id={fieldProps.name}
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                        size={size}
                        disabled={disabled}
                    />
                </div>
            )}
        />
    );
}
