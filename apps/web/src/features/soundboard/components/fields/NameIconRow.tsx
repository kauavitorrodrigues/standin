import type { UseFormReturn } from "react-hook-form";
import type { SoundboardClipFormValues } from "@standin/contracts";
import { ClipIconField } from "./IconField";
import { ClipNameField } from "./NameField";

type Props = {
    form: UseFormReturn<SoundboardClipFormValues>;
    disabled: boolean;
};

// The name takes the room on the left and the icon is a small square at the
// end, both under their labels.
export const NameIconRow = ({ form, disabled }: Props) => (
    <div className="flex items-start gap-2">
        <ClipNameField form={form} disabled={disabled} />
        <ClipIconField form={form} disabled={disabled} />
    </div>
);
