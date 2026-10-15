import {
    ROOM_CROSS_DIRECTIONS,
    type RoomCrossDirection,
} from "@standin/contracts";

/**
 * Which way the avatar went across the threshold, from the room it was in and
 * the one it is in now (null is outside every room). Only a change of side
 * counts, so standing still gives null. Going from one room straight into
 * another is an entry into the second.
 */
export const getCrossing = (
    previous: string | null,
    current: string | null
): RoomCrossDirection | null => {
    if (previous === current) return null;
    if (current === null) return ROOM_CROSS_DIRECTIONS.OUT;

    return ROOM_CROSS_DIRECTIONS.IN;
};
