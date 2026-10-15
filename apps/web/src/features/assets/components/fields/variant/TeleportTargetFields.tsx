import type { Control } from "react-hook-form";
import { ASSET_ACTIONS, type AssetDefinition } from "@standin/contracts";
import { NumberFormField } from "@/components/fields/NumberFormField";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    control: Control<AddVariantFormValues>;
    action: AssetDefinition["action"];
    isNewRotation: boolean;
    disabled: boolean;
};

// The target of a teleport is a cell of the map, so it cannot be marked on
// the image. Only a new rotation of a teleport asks for it.
export const TeleportTargetFields = ({
    control,
    action,
    isNewRotation,
    disabled,
}: Props) => {
    if (!isNewRotation || action !== ASSET_ACTIONS.TELEPORT) return null;

    return (
        <div className="grid grid-cols-2 gap-2">
            <NumberFormField
                control={control}
                name="targetX"
                label="Destino (coluna)"
                hint="A coluna do mapa para onde o teleporte leva."
                required
                min={0}
                disabled={disabled}
            />
            <NumberFormField
                control={control}
                name="targetY"
                label="Destino (linha)"
                hint="A linha do mapa para onde o teleporte leva."
                required
                min={0}
                disabled={disabled}
            />
        </div>
    );
};
