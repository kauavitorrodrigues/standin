import type { Control } from "react-hook-form";
import type { AssetDefinition } from "@standin/contracts";
import { SelectFormField } from "@/components/fields/SelectFormField";
import type { RoomDoorValues } from "@/features/editor/types/room-door-values";

type DoorAssetFieldProps = {
    control: Control<RoomDoorValues>;
    assets: readonly AssetDefinition[];
};

// Which door asset goes into the room. With one asset there is nothing to
// choose, so the field does not show.
export const DoorAssetField = ({ control, assets }: DoorAssetFieldProps) => {
    if (assets.length < 2) return null;

    return (
        <SelectFormField
            control={control}
            name="doorAssetId"
            label="Porta"
            options={assets.map(({ id, name }) => ({
                value: id,
                label: name,
            }))}
        />
    );
};
