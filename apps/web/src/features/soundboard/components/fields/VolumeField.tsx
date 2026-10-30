import type { UseFormReturn } from "react-hook-form";
import type { SoundboardClipFormValues } from "@standin/contracts";
import { GenericFormField } from "@/components/fields/GenericFormField";
import { VolumeSlider } from "./VolumeSlider";

type Props = {
    form: UseFormReturn<SoundboardClipFormValues>;
    disabled: boolean;
};

// How loud the clip plays, from 0 to 100% of its recorded level.
export const ClipVolumeField = ({ form, disabled }: Props) => (
    <GenericFormField
        control={form.control}
        name="volume"
        label="Volume"
        render={(field) => (
            <VolumeSlider
                volume={field.value}
                onChange={field.onChange}
                disabled={disabled}
            />
        )}
    />
);
