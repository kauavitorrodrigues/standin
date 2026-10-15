import type { Control } from "react-hook-form";
import { PngFormField } from "@/components/fields/PngFormField";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    control: Control<AddVariantFormValues>;
    // Once the PNG is chosen it goes to the info panel, and the dropzone goes.
    hasFile: boolean;
    disabled: boolean;
};

export const ImageField = ({ control, hasFile, disabled }: Props) => {
    if (hasFile) return null;

    return (
        <PngFormField
            control={control}
            id="add-variant-image"
            label="PNG da variação"
            hint="O PNG inteiro desta variação, com o mesmo tamanho de frame das outras da mesma rotação. Se a peça é animada, uma faixa com a mesma quantidade de frames."
            placeholder="Arraste o PNG ou clique."
            disabled={disabled}
        />
    );
};
