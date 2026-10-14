import { useFormContext } from "react-hook-form";
import { SwitchFormField } from "@/components/fields/SwitchFormField";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";
import { ZoneLabelField } from "./ZoneLabelField";

// Whether placing the area also creates a zone of the area, and the label it
// gets. It sits in the side panel, under the lists.
export const AreaZoneBox = () => {
    const { control } = useFormContext<AreaComposerFormValues>();

    return (
        <div className="flex shrink-0 flex-col gap-3 border-t px-3 py-3">
            <SwitchFormField
                control={control}
                name="createZone"
                label="Criar zona de área ao colocar"
                hint="Ao colocar a área num mapa, ela vira uma zona com nome, que aparece no editor e para quem estiver no espaço."
            />
            <ZoneLabelField />
        </div>
    );
};
