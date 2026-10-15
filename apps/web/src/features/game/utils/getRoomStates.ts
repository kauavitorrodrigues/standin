import type { RoomDoorState } from "@standin/contracts";
import type { GameRoom, RoomDoorStates } from "@/features/game/types/room";

// The state of every room of the map, with the ones the server never mentioned
// as `open`. The door view and the colliders read a complete map.
export const getRoomStates = (
    rooms: readonly GameRoom[],
    getState: (roomKey: string) => RoomDoorState
): RoomDoorStates =>
    new Map(rooms.map((room) => [room.key, getState(room.key)]));
