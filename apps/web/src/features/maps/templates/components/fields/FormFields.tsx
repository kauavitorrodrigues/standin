import type { UseFormReturn } from "react-hook-form";
import {
    ENABLED_SIZE_TIERS,
    MAX_MAP_TEMPLATE_NAME_LENGTH,
    type MapTemplateDataSchemaType,
} from "@standin/contracts";
import { SelectFormField } from "@/components/fields/SelectFormField";
import { TextFormField } from "@/components/fields/TextFormField";
import { TextareaFormField } from "@/components/fields/TextareaFormField";
import { getSizeTierLabel } from "../../utils/getSizeTierLabel";

type Props = {
    form: UseFormReturn<MapTemplateDataSchemaType>;
    disabled: boolean;
};

const tierOptions = ENABLED_SIZE_TIERS.map((tier) => ({
    value: tier,
    label: getSizeTierLabel(tier),
}));

export const TemplateFormFields = ({ form, disabled }: Props) => (
    <div className="flex flex-col gap-4">
        <TextFormField
            control={form.control}
            name="name"
            label="Nome"
            required
            placeholder="Nome do template"
            disabled={disabled}
            maxLength={MAX_MAP_TEMPLATE_NAME_LENGTH}
        />
        <TextareaFormField
            control={form.control}
            name="description"
            label="Descrição"
            placeholder="Descrição do template"
            disabled={disabled}
            rows={3}
        />
        <SelectFormField
            control={form.control}
            name="sizeTier"
            label="Tamanho"
            required
            placeholder="Escolha o tamanho"
            disabled={disabled}
            options={tierOptions}
        />
    </div>
);
