import { useFormContext } from "react-hook-form";
import { AREA_NAME_MAX } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";

// The name of the area, the first field of the properties of the area.
export const AreaNameField = () => {
    const { control } = useFormContext<AreaComposerFormValues>();

    return (
        <TextFormField
            control={control}
            name="name"
            label="Nome da área"
            placeholder="Nome da área"
            maxLength={AREA_NAME_MAX}
        />
    );
};
