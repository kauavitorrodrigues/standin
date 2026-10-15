import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from "react-hook-form";
import { FileUploadFormField } from "@/components/fields/FileUploadFormField";

type WithImage = FieldValues & { image: File[] };

type Props<T extends WithImage> = {
    control: Control<T>;
    id: string;
    label: string;
    hint?: string;
    placeholder: string;
    disabled?: boolean;
    dropzoneClassName?: string;
    // Leaves only the chosen file once there is one.
    hideDropzoneWhenFilled?: boolean;
    // Called with the file just chosen, to fill other fields from it.
    onFileChosen?: (file: File) => void;
};

// The single PNG of a library upload, kept in the `image` field of the form.
export function PngFormField<T extends WithImage>({
    control,
    id,
    label,
    hint,
    placeholder,
    disabled,
    dropzoneClassName,
    hideDropzoneWhenFilled,
    onFileChosen,
}: Props<T>) {
    return (
        <Controller
            control={control}
            name={"image" as Path<T>}
            render={({ field, fieldState }) => (
                <FileUploadFormField
                    id={id}
                    label={label}
                    hint={hint}
                    required
                    placeholder={placeholder}
                    accept="image/png"
                    maxFiles={1}
                    dropzoneClassName={dropzoneClassName}
                    hideDropzoneWhenFilled={hideDropzoneWhenFilled}
                    value={field.value as File[]}
                    onValueChange={(files) => {
                        field.onChange(files);
                        const [next] = files;
                        if (next) onFileChosen?.(next);
                    }}
                    disabled={disabled}
                    error={fieldState.error?.message}
                />
            )}
        />
    );
}
