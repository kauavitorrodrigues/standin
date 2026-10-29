import type { DoorSide } from "@standin/contracts";

export type PlaceDoorParams = {
    // The key of the room, as set in createRoom.
    room: string;
    side: DoorSide;
    // The key of any variant of the door family. The variant for the side of
    // the wall is picked from the family, as the editor does.
    door: string;
    // Where the door starts along the wall, in cells from the first cell of
    // the side. Left out, the door is centered.
    offset?: number;
};
