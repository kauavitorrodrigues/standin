import type { UseFormReturn } from "react-hook-form";
import { SOUNDBOARD_NAME_MAX } from "@standin/contracts";
import type { SoundboardClipFormValues } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";

type Props = {
    form: UseFormReturn<SoundboardClipFormValues>;
    disabled: boolean;
};

export const ClipNameField = ({ form, disabled }: Props) => (
    <TextFormField
        control={form.control}
        name="name"
        label="Nome"
        required
        placeholder="Nome do clipe"
        disabled={disabled}
        maxLength={SOUNDBOARD_NAME_MAX}
        className="min-w-0 flex-1"
    />
);
