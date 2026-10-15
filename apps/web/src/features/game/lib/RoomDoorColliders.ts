import { ROOM_DOOR_STATES, type RoomDoorState } from "@standin/contracts";
import type { GameRoomDoor, RoomDoorStates } from "@/features/game/types/room";
import type { SolidColliderPort } from "@/features/game/types/placed-sync";

// Whether the cell of a door stops the avatar, from the state of its room.
// Only a locked room has solid doors: a closed one opens by the step.
const isDoorSolid = (state: RoomDoorState | undefined): boolean => {
    switch (state) {
        case ROOM_DOOR_STATES.LOCKED:
            return true;
        case ROOM_DOOR_STATES.OPEN:
        case ROOM_DOOR_STATES.CLOSED:
        default:
            return false;
    }
};

// One solid body per door of a locked room, kept by the id of the door.
export class RoomDoorColliders {
    private readonly port: SolidColliderPort;
    private doors: GameRoomDoor[] = [];
    private states: RoomDoorStates = new Map();
    // The rect each body was built from, to rebuild only the ones that moved.
    private readonly solidRects = new Map<string, string>();

    constructor(port: SolidColliderPort) {
        this.port = port;
    }

    setDoors(doors: GameRoomDoor[]): void {
        this.doors = doors;
        this.sync();
    }

    setStates(states: RoomDoorStates): void {
        this.states = states;
        this.sync();
    }

    // Adds the bodies that are missing, drops the ones that are not due and
    // rebuilds the ones whose door moved.
    private sync(): void {
        const wanted = new Map(
            this.doors
                .filter((door) => isDoorSolid(this.states.get(door.roomKey)))
                .map((door) => [door.id, door])
        );

        [...this.solidRects.keys()].forEach((id) => {
            if (wanted.has(id)) return;
            this.port.remove(id);
            this.solidRects.delete(id);
        });
        wanted.forEach((door, id) => {
            const { x, y, width, height } = door;
            const signature = `${x},${y},${width},${height}`;
            if (this.solidRects.get(id) === signature) return;

            this.port.set(id, [{ x, y, width, height }]);
            this.solidRects.set(id, signature);
        });
    }
}
