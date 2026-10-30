import type { UseFormReturn } from "react-hook-form";
import type { SoundboardClipFormValues } from "@standin/contracts";
import { GenericFormField } from "@/components/fields/GenericFormField";
import { IconPicker } from "./IconPicker";

type Props = {
    form: UseFormReturn<SoundboardClipFormValues>;
    disabled: boolean;
};

export const ClipIconField = ({ form, disabled }: Props) => (
    <GenericFormField
        control={form.control}
        name="icon"
        label="Ícone"
        className="w-auto shrink-0"
        render={(field) => (
            <IconPicker
                icon={field.value}
                onChange={field.onChange}
                disabled={disabled}
            />
        )}
    />
);
