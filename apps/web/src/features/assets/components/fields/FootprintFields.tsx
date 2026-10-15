import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { NumberFormField } from "@/components/fields/NumberFormField";

type WithFootprint = FieldValues & {
    footprintW: number | undefined;
    footprintH: number | undefined;
    footprintOffsetX: number | undefined;
};

type Props<T extends WithFootprint> = {
    control: Control<T>;
    disabled?: boolean;
};

// The tiles an asset occupies on the floor, counted from the bottom of the
// frame, and how many tiles the footprint is shifted to the right.
export function FootprintFields<T extends WithFootprint>({
    control,
    disabled,
}: Props<T>) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <NumberFormField
                control={control}
                name={"footprintW" as FieldPath<T>}
                label="Pegada (largura)"
                hint="Quantas células de largura a peça ocupa no chão."
                required
                min={1}
                disabled={disabled}
            />
            <NumberFormField
                control={control}
                name={"footprintH" as FieldPath<T>}
                label="Pegada (altura)"
                hint="Quantas células de altura a peça ocupa no chão, contadas a partir da base do frame."
                required
                min={1}
                disabled={disabled}
            />
            <NumberFormField
                control={control}
                name={"footprintOffsetX" as FieldPath<T>}
                label="Deslocamento"
                hint="Quantas células a pegada fica deslocada para a direita dentro do frame."
                disabled={disabled}
            />
        </div>
    );
}
