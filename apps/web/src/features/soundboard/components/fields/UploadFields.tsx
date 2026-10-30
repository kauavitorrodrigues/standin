import type { UseFormReturn } from "react-hook-form";
import type { SoundboardClipFormValues } from "@standin/contracts";
import { ClipFormFields } from "./FormFields";

type Props = {
    visible: boolean;
    form: UseFormReturn<SoundboardClipFormValues>;
    disabled: boolean;
};

// The fields of the upload, once there is a file to give them a name.
export const UploadFields = ({ visible, form, disabled }: Props) => {
    if (!visible) return null;

    return <ClipFormFields form={form} disabled={disabled} />;
};
