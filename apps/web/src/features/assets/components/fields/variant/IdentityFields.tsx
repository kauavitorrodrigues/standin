import type { Control } from "react-hook-form";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import { ColorFields } from "../ColorFields";
import { RotationField } from "./RotationField";

type Props = {
    control: Control<AddVariantFormValues>;
    familyHasColor: boolean;
    disabled: boolean;
};

// What tells a variation from the others: its rotation, and its color when
// the family has color. They share a row.
export const IdentityFields = ({
    control,
    familyHasColor,
    disabled,
}: Props) => {
    const rotation = <RotationField control={control} disabled={disabled} />;
    if (!familyHasColor) return rotation;

    return (
        <ColorFields
            control={control}
            required
            leading={rotation}
            disabled={disabled}
            hint="A chave identifica a cor (vermelho, azul) e o hex é a cor do círculo na paleta."
        />
    );
};
