import { useForm, useWatch } from "react-hook-form";
import type { Zone } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { DoorAssetField } from "@/features/editor/components/fields/DoorAssetField";
import { RoomDoorList } from "@/features/editor/components/views/room-panel/RoomDoorList";
import { RoomWarnings } from "@/features/editor/components/views/room-panel/RoomWarnings";
import { formatDoorCount } from "@/features/editor/hooks/room/formatDoorCount";
import { getDoorAssets } from "@/features/editor/hooks/room/getDoorAssets";
import { useDraftSelector } from "@/features/editor/hooks/useDraftSelector";
import { useRoomDoors } from "@/features/editor/hooks/room/useRoomDoors";
import type { RoomDoorValues } from "@/features/editor/types/room-door-values";

type RoomDoorsFormProps = {
    room: Zone;
};

// The doors of one room: the count, the list with a remove button each, the
// warnings and the button that adds a door at the first free gap of the walls.
// Keyed by the room, so each room starts with its own state.
export const RoomDoorsForm = ({ room }: RoomDoorsFormProps) => {
    const library = useDraftSelector((state) => state.draft.library);
    const form = useForm<RoomDoorValues>({
        defaultValues: { doorAssetId: getDoorAssets({ library })[0]?.id ?? "" },
    });
    const chosen = useWatch({ control: form.control, name: "doorAssetId" });
    const roomDoors = useRoomDoors(room.key ?? "", chosen);

    return (
        <form
            onSubmit={form.handleSubmit(roomDoors.addDoor)}
            className="flex flex-col gap-2"
        >
            <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">
                    {room.label}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatDoorCount(roomDoors.doors.length)}
                </span>
            </div>
            <RoomDoorList
                doors={roomDoors.doors}
                onRemove={roomDoors.removeDoor}
            />
            <RoomWarnings
                warnings={roomDoors.warnings}
                notice={roomDoors.notice}
            />
            <DoorAssetField
                control={form.control}
                assets={roomDoors.doorAssets}
            />
            <Button type="submit" size="sm" disabled={!roomDoors.canAdd}>
                Adicionar porta
            </Button>
        </form>
    );
};
