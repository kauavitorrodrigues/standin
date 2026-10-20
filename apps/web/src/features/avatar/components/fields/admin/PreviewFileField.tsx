import type { Control, FieldValues, Path } from "react-hook-form";
import { SheetFormField } from "./SheetFormField";

type Props<T extends FieldValues> = {
    control: Control<T>;
    name: string;
    id: string;
    label: string;
    required?: boolean;
    disabled?: boolean;
    largePreview?: boolean;
    hideDropzoneWhenFilled?: boolean;
};

// The image of a list: any PNG within the size limit, not a sheet of the grid.
export function PreviewFileField<T extends FieldValues>({
    control,
    name,
    id,
    label,
    required,
    disabled,
    largePreview,
    hideDropzoneWhenFilled,
}: Props<T>) {
    return (
        <SheetFormField
            control={control}
            name={name as Path<T>}
            id={id}
            label={label}
            hint="Aparece nas listas do editor de avatar. Pode ser qualquer PNG, sem tamanho fixo."
            required={required}
            disabled={disabled}
            largePreview={largePreview}
            hideDropzoneWhenFilled={hideDropzoneWhenFilled}
        />
    );
}
