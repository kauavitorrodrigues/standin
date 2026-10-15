import type { Control } from "react-hook-form";
import { SelectFormField } from "@/components/fields/SelectFormField";
import { ROTATION_OPTIONS } from "@/features/assets/consts/rotationMeta";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    control: Control<AddVariantFormValues>;
    disabled: boolean;
};

export const RotationField = ({ control, disabled }: Props) => (
    <SelectFormField
        control={control}
        name="rotation"
        label="Rotação"
        hint="Escolha uma rotação que a família já tem para adicionar uma cor nela. Uma rotação nova também pede a pegada e as ações dela, porque o espaço ocupado e a direção do assento mudam ao girar."
        options={ROTATION_OPTIONS}
        disabled={disabled}
    />
);
