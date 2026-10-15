import { useFormContext } from "react-hook-form";
import { MapPinIcon } from "lucide-react";
import { SwitchCardField } from "@/components/fields/SwitchCardField";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";

// Whether placing the area also creates a zone of the area, named after it.
export const AreaZoneBox = () => {
    const { control } = useFormContext<AreaComposerFormValues>();

    return (
        <SwitchCardField
            control={control}
            name="createZone"
            icon={MapPinIcon}
            title="Criar uma zona ao colocar"
            description="Ao colocar a área num mapa, ela vira uma zona com o nome da área, que aparece no editor e para quem estiver no espaço."
        />
    );
};
