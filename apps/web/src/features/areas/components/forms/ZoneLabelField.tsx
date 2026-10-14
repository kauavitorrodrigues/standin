import { useFormContext, useWatch } from "react-hook-form";
import { AREA_NAME_MAX } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";

// The label of the zone, shown while the area creates one. Left empty it is
// the name, which the field shows as its placeholder.
export const ZoneLabelField = () => {
    const { control } = useFormContext<AreaComposerFormValues>();
    const createZone = useWatch({ control, name: "createZone" });
    const name = useWatch({ control, name: "name" });

    if (!createZone) return null;

    return (
        <TextFormField
            control={control}
            name="zoneLabel"
            label="Rótulo da zona"
            placeholder={name}
            maxLength={AREA_NAME_MAX}
        />
    );
};
