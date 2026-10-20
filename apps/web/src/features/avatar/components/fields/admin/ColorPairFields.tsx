import type { Control, FieldValues, Path } from "react-hook-form";
import { ColorFormField } from "@/components/fields/ColorFormField";
import { TextFormField } from "@/components/fields/TextFormField";

type Props<T extends FieldValues> = {
    control: Control<T>;
    required?: boolean;
    disabled?: boolean;
};

// The color of a row of a part: its name and the swatch shown in the editor.
// The form needs the fields `colorKey` and `colorHex`. They are both filled or
// both empty, and `required` says that empty is not an option.
export function ColorPairFields<T extends FieldValues>({
    control,
    required,
    disabled,
}: Props<T>) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-1">
                <TextFormField
                    control={control}
                    name={"colorKey" as Path<T>}
                    label="Nome da cor"
                    placeholder="Vermelho"
                    required={required}
                    disabled={disabled}
                />
            </div>
            <ColorFormField
                control={control}
                name={"colorHex" as Path<T>}
                label="Cor"
                required={required}
                disabled={disabled}
            />
        </div>
    );
}
