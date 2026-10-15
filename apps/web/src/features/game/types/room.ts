import type { RoomDoorState } from "@standin/contracts";
import type { PlacedRect } from "@/features/game/utils/placed";

type Point = { x: number; y: number };

// A room of the map: a `private` zone, in world pixels.
export type GameRoom = {
    // The `key` of the zone, the identity the server knows the room by.
    key: string;
    // The `label` of the zone, shown to the people inside.
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    // Points relative to x and y, for a room that is not a rectangle.
    polygon?: Point[];
};

// A placed door tied to the room it closes, in world pixels.
export type GameRoomDoor = {
    // The id of the placed object.
    id: string;
    roomKey: string;
    // Top left corner and size of the cell the door covers.
    x: number;
    y: number;
    width: number;
    height: number;
    // What a locked door blocks, when it is less than its whole cell: the trace
    // of the wall around it, in px. Missing means the whole cell blocks.
    solidRects?: PlacedRect[];
};

// What the rest of the game reads of the doors, kept in sync with the server.
export type RoomDoorStates = ReadonlyMap<string, RoomDoorState>;

// The locked rooms the local avatar may walk into: every one for the owner of
// the space, or the ones where someone inside accepted it.
export type RoomEntitlements = {
    all: boolean;
    roomKeys: ReadonlySet<string>;
};
