import type { UseFormReturn } from "react-hook-form";
import type { SoundboardClipFormValues } from "@standin/contracts";
import { NameIconRow } from "./NameIconRow";
import { ClipVolumeField } from "./VolumeField";

type Props = {
    form: UseFormReturn<SoundboardClipFormValues>;
    disabled: boolean;
};

// What a clip carries besides its sound, shared by the upload and the edit.
export const ClipFormFields = ({ form, disabled }: Props) => (
    <>
        <ClipVolumeField form={form} disabled={disabled} />
        <NameIconRow form={form} disabled={disabled} />
    </>
);
