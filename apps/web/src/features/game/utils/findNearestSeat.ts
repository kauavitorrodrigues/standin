import type { SeatSpot } from "@/features/game/utils/buildSeatAreas";

type Point = { x: number; y: number };

// The seat of the area closest to the avatar, since a sofa has more than one.
export const findNearestSeat = (
    seats: readonly SeatSpot[],
    point: Point
): SeatSpot | null => {
    let nearest: SeatSpot | null = null;
    let best = Infinity;
    for (const seat of seats) {
        const distance = Math.hypot(seat.x - point.x, seat.y - point.y);
        if (distance < best) {
            best = distance;
            nearest = seat;
        }
    }
    return nearest;
};
