import type { SeatSpot } from "@/features/game/utils/buildSeatAreas";

type Point = { x: number; y: number };

// The seat of the area closest to the avatar, since a sofa has more than one.
// Distance is counted in steps along the two axes, since the avatar walks on a
// grid. On a tie the first seat of the list wins, so every client agrees.
export const findNearestSeat = (
    seats: readonly SeatSpot[],
    point: Point
): SeatSpot | null => {
    let nearest: SeatSpot | null = null;
    let best = Infinity;
    for (const seat of seats) {
        const distance = Math.abs(seat.x - point.x) + Math.abs(seat.y - point.y);
        if (distance < best) {
            best = distance;
            nearest = seat;
        }
    }
    return nearest;
};
