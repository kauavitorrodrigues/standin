import type { UseFormReturn } from "react-hook-form";
import { ASSET_TYPES } from "@standin/contracts";
import { SelectFormField } from "@/components/fields/SelectFormField";
import { DerivedCategoryField } from "@/features/assets/components/views/asset/DerivedCategoryField";
import { CATEGORY_OPTIONS } from "@/features/assets/consts/createForm";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";

type Props = {
    form: UseFormReturn<CreateAssetFormValues>;
    type: CreateAssetFormValues["type"];
    disabled: boolean;
};

// The category of the asset. A decoration has no default one, so it is chosen.
// Any other type brings its own, which is only shown.
export const CategoryField = ({ form, type, disabled }: Props) => {
    if (type !== ASSET_TYPES.DECORATION)
        return <DerivedCategoryField type={type} />;

    return (
        <SelectFormField
            control={form.control}
            name="category"
            label="Categoria"
            hint="A aba da paleta do editor em que a peça aparece. Só organiza, não muda nenhuma regra. Decoração não tem categoria padrão, então você escolhe; os outros tipos usam a categoria do próprio tipo."
            options={CATEGORY_OPTIONS}
            placeholder="Escolha uma categoria"
            disabled={disabled}
        />
    );
};
