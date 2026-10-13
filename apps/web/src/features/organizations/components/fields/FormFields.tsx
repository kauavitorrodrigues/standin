import type { UseFormReturn } from "react-hook-form";
import {
    MAX_ORGANIZATION_NAME_LENGTH,
    type OrganizationDataSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";

type Props = {
    form: UseFormReturn<OrganizationDataSchemaType>;
    disabled: boolean;
};

export const OrganizationFormFields = ({ form, disabled }: Props) => (
    <TextFormField
        control={form.control}
        name="name"
        label="Nome"
        required
        placeholder="Nome da organização"
        disabled={disabled}
        maxLength={MAX_ORGANIZATION_NAME_LENGTH}
    />
);
