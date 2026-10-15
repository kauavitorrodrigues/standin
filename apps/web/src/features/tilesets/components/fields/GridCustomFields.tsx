import type { Control } from "react-hook-form";
import { GenericFormField } from "@/components/fields/GenericFormField";
import { NumberField } from "@/components/fields/NumberField";
import type { TilesetGridFormValues } from "../../types/gridForm";

type Props = {
    control: Control<TilesetGridFormValues>;
    disabled: boolean;
};

type FieldProps = Props & {
    name: keyof TilesetGridFormValues;
    label: string;
    hint: string;
};

const GridField = ({ control, disabled, name, label, hint }: FieldProps) => (
    <GenericFormField
        control={control}
        name={name}
        label={label}
        hint={hint}
        className="min-w-0"
        render={(field) => (
            <span className="relative">
                <NumberField
                    id={name}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    min={0}
                    disabled={disabled}
                    className="w-full pr-9"
                />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                    px
                </span>
            </span>
        )}
    />
);

// The margin and the spacing typed by hand, for a sheet that none of the
// divisions of the picker fits. They fill the width, side by side, and each
// says what it is in the tooltip of its label.
export const TilesetGridCustomFields = ({ control, disabled }: Props) => (
    <div className="grid grid-cols-2 gap-3">
        <GridField
            control={control}
            disabled={disabled}
            name="margin"
            label="Margem"
            hint="Pixels entre a borda da imagem e a primeira célula."
        />
        <GridField
            control={control}
            disabled={disabled}
            name="spacing"
            label="Espaçamento"
            hint="Pixels entre uma célula e a seguinte."
        />
    </div>
);
