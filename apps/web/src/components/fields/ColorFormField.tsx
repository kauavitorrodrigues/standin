import type { FieldPath, FieldValues } from "react-hook-form";
import { ColorPicker } from "@/components/ui/color-picker";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";

type ColorFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    disabled?: boolean;
};

export function ColorFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ disabled, ...fieldProps }: ColorFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            className="w-fit"
            {...fieldProps}
            render={(field) => (
                // The wrapper keeps the trigger from being stretched by the
                // `*:w-full` of the field, which would make it oval.
                <div className="flex">
                    <ColorPicker
                        name={fieldProps.name}
                        value={
                            typeof field.value === "string" ? field.value : ""
                        }
                        onChange={field.onChange}
                        disabled={disabled}
                    />
                </div>
            )}
        />
    );
}
