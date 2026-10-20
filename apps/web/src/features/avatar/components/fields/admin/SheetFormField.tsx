import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from "react-hook-form";
import { FileUploadFormField } from "@/components/fields/FileUploadFormField";

type Props<T extends FieldValues> = {
    control: Control<T>;
    // The field that keeps the file: `image` or `preview`.
    name: Path<T>;
    id: string;
    label: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    compact?: boolean;
    largePreview?: boolean;
    hideDropzoneWhenFilled?: boolean;
};

// A PNG sheet of a part, kept as a one-file list in the form.
export function SheetFormField<T extends FieldValues>({
    control,
    name,
    id,
    label,
    hint,
    required,
    disabled,
    className,
    compact,
    largePreview,
    hideDropzoneWhenFilled,
}: Props<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FileUploadFormField
                    id={id}
                    label={label}
                    hint={hint}
                    required={required}
                    placeholder="Arraste o PNG ou clique."
                    accept="image/png"
                    maxFiles={1}
                    value={field.value as File[]}
                    onValueChange={field.onChange}
                    disabled={disabled}
                    error={fieldState.error?.message}
                    className={className}
                    compact={compact}
                    largePreview={largePreview}
                    hideDropzoneWhenFilled={hideDropzoneWhenFilled}
                />
            )}
        />
    );
}
