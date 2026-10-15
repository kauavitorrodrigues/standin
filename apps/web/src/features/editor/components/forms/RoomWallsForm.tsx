import { useForm, useWatch } from "react-hook-form";
import type { Zone } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { WallStyleField } from "@/features/editor/components/fields/WallStyleField";
import { RoomWarnings } from "@/features/editor/components/views/room-panel/RoomWarnings";
import { useRoomWalls } from "@/features/editor/hooks/room-walls/useRoomWalls";
import type { RoomWallValues } from "@/features/editor/types/room-wall-values";

type RoomWallsFormProps = {
    room: Zone;
};

// The button that draws the walls around a room, in a style of the library.
// It does not show while the library has no complete wall style.
export const RoomWallsForm = ({ room }: RoomWallsFormProps) => {
    const form = useForm<RoomWallValues>({ defaultValues: { style: "" } });
    const chosen = useWatch({ control: form.control, name: "style" });
    const walls = useRoomWalls(room, chosen);

    if (walls.styles.length === 0) return null;

    return (
        <form
            onSubmit={form.handleSubmit(walls.drawWalls)}
            className="flex flex-col gap-2"
        >
            <WallStyleField control={form.control} styles={walls.styles} />
            <RoomWarnings warnings={[]} notice={walls.notice} />
            <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!walls.canDraw}
            >
                Gerar paredes da sala
            </Button>
        </form>
    );
};
