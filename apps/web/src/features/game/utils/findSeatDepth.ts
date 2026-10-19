import type { SeatArea } from "@/features/game/utils/buildSeatAreas";
import { isSeatTaken } from "@/features/game/utils/isSeatTaken";

// The depth of the piece whose seat is where a seated peer stands, or null
// when no seat is there. The position comes over the network, so the match
// absorbs its rounding.
export const findSeatDepth = (
    areas: readonly SeatArea[],
    point: { x: number; y: number }
): number | null => {
    for (const area of areas) {
        const seat = area.seats.find((spot) => isSeatTaken(spot, [point]));
        if (seat) return seat.depth;
    }

    return null;
};
