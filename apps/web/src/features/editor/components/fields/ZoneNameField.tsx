import type { Control } from "react-hook-form";
import { TextFormField } from "@/components/fields/TextFormField";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneNameValues } from "@/features/editor/schemas/zone-name.schema";
import type { ZoneKind } from "@/features/editor/types/zone-kind";

type ZoneNameFieldProps = {
    control: Control<ZoneNameValues>;
    kind: ZoneKind;
};

// The name field of a new zone: the room asks for the name of a room and
// anything else for the name of an area.
export const ZoneNameField = ({ control, kind }: ZoneNameFieldProps) => {
    if (kind === ZONE_KINDS.ROOM) {
        return (
            <TextFormField
                control={control}
                name="label"
                label="Nome da sala"
                required
                placeholder="Ex.: Sala de reunião"
            />
        );
    }

    return (
        <TextFormField
            control={control}
            name="label"
            label="Nome da área"
            required
            placeholder="Ex.: Copa"
        />
    );
};
