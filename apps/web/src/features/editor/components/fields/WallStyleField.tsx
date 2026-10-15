import type { Control } from "react-hook-form";
import { SelectFormField } from "@/components/fields/SelectFormField";
import type { RoomWallStyle } from "@/features/editor/types/room-wall-style";
import type { RoomWallValues } from "@/features/editor/types/room-wall-values";

type WallStyleFieldProps = {
    control: Control<RoomWallValues>;
    styles: readonly RoomWallStyle[];
};

// Which wall style the room is drawn with. With one style there is nothing to
// choose, so the field does not show.
export const WallStyleField = ({ control, styles }: WallStyleFieldProps) => {
    if (styles.length < 2) return null;

    return (
        <SelectFormField
            control={control}
            name="style"
            label="Estilo da parede"
            options={styles.map(({ value, label }) => ({ value, label }))}
        />
    );
};
