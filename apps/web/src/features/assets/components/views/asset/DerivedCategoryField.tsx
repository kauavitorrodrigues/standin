import { ASSET_CATEGORY_DISPLAY_META } from "@/features/assets/consts/categoryMeta";
import { CategoryIcon } from "./CategoryIcon";
import { Field, FieldLabel } from "@/components/ui/field";
import { FieldHint } from "@/components/fields/FieldHint";
import {
    DEFAULT_CATEGORY_BY_TYPE,
    type AssetCategory,
} from "@standin/contracts";

type Props = { type: keyof typeof DEFAULT_CATEGORY_BY_TYPE };

// The category a type brings with it, shown like the select it replaces but
// not editable. Only a DECORATION chooses its own.
export const DerivedCategoryField = ({ type }: Props) => {
    const category: AssetCategory | undefined = DEFAULT_CATEGORY_BY_TYPE[type];
    const meta = category ? ASSET_CATEGORY_DISPLAY_META[category] : undefined;

    return (
        <Field>
            <div className="flex items-center gap-1.5">
                <FieldLabel className="w-auto">Categoria</FieldLabel>
                <FieldHint>
                    A aba da paleta do editor em que a peça aparece. Para este
                    tipo ela vem do próprio tipo. Só Decoração permite escolher.
                </FieldHint>
            </div>
            <div className="bg-input/30 text-muted-foreground flex h-8 items-center gap-2 rounded-lg border px-2.5 text-sm">
                <CategoryIcon icon={meta?.icon} color={meta?.color} />
                {meta?.label}
            </div>
        </Field>
    );
};
