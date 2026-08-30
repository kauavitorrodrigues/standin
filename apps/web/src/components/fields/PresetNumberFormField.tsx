import type { FieldPath, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { NumberField } from "./NumberField";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";

type PresetNumberFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    presets: number[];
    unit?: string;
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
};

export function PresetNumberFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    presets,
    unit = "",
    placeholder = "Outro",
    disabled,
    min = 1,
    max,
    ...fieldProps
}: PresetNumberFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            {...fieldProps}
            render={(field) => (
                <div className="flex flex-wrap items-center gap-2">
                    {presets.map((preset) => (
                        <Button
                            key={preset}
                            type="button"
                            variant={
                                field.value === preset ? "default" : "outline"
                            }
                            size="sm"
                            disabled={disabled}
                            onClick={() => field.onChange(preset)}
                        >
                            {preset}
                            {unit}
                        </Button>
                    ))}
                    <NumberField
                        id={fieldProps.name}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        min={min}
                        max={max}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-24"
                    />
                </div>
            )}
        />
    );
}
