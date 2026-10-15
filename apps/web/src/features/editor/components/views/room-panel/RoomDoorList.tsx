import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoomDoorLabel } from "@/features/editor/hooks/room/getRoomDoorLabels";

type RoomDoorListProps = {
    doors: readonly RoomDoorLabel[];
    onRemove: (id: string) => void;
};

// The doors of the room, each with a button to remove it.
export const RoomDoorList = ({ doors, onRemove }: RoomDoorListProps) => {
    if (doors.length === 0) return null;

    return (
        <ul className="flex flex-col gap-1">
            {doors.map((door) => (
                <li
                    key={door.id}
                    className="flex items-center justify-between gap-2 text-xs"
                >
                    <span className="flex flex-col">
                        <span className="font-medium">{door.label}</span>
                        <span className="text-muted-foreground">
                            {door.position}
                        </span>
                    </span>
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remover ${door.label}`}
                        onClick={() => onRemove(door.id)}
                    >
                        <Trash2Icon />
                    </Button>
                </li>
            ))}
        </ul>
    );
};
