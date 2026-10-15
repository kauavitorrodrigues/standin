import { useFormContext, useWatch } from "react-hook-form";
import { SelectFormField } from "@/components/fields/SelectFormField";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";

// Whether the zone the area creates is a plain area or a room, where doors
// work. It sits beside the name and only applies while the area creates a zone.
export const AreaZoneKindField = () => {
    const { control } = useFormContext<AreaComposerFormValues>();
    const createZone = useWatch({ control, name: "createZone" });

    return (
        <SelectFormField
            control={control}
            name="zoneKind"
            label="Tipo"
            hint="Uma sala é uma zona privada: só nela as portas funcionam, e as portas da área precisam ficar na borda do quadro. O tipo vale quando a área cria uma zona."
            disabled={!createZone}
            options={[
                { value: "area", label: "Zona de área" },
                { value: "private", label: "Sala" },
            ]}
        />
    );
};
