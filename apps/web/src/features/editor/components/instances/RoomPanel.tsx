import { RoomDoorsForm } from "@/features/editor/components/forms/RoomDoorsForm";
import { RoomWallsForm } from "@/features/editor/components/forms/RoomWallsForm";
import { FloatingPanel } from "@/features/editor/components/layout/FloatingPanel";
import { useSelectedRoom } from "@/features/editor/hooks/room/useSelectedRoom";

// The panel of the selected room: its doors and the button to add one, and
// the button that draws its walls. It
// shows only while a room (a private zone) is selected.
export const RoomPanel = () => {
    const room = useSelectedRoom();

    if (!room) return null;

    return (
        <FloatingPanel className="top-3 right-3 flex w-64 flex-col gap-3 p-3">
            <RoomDoorsForm key={room.key} room={room} />
            <RoomWallsForm key={`${room.key}-walls`} room={room} />
        </FloatingPanel>
    );
};
