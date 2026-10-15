type Point = { x: number; y: number };

// A seated avatar sits exactly on the spot, so this only absorbs the rounding
// of the position that travels over the network.
const SEAT_MATCH_TOLERANCE_PX = 4;

// Whether one of the points, the seated avatars, is on the seat.
export const isSeatTaken = (
    seat: Point,
    seatedPoints: Iterable<Point>
): boolean => {
    for (const point of seatedPoints) {
        const distance = Math.hypot(seat.x - point.x, seat.y - point.y);
        if (distance <= SEAT_MATCH_TOLERANCE_PX) return true;
    }
    return false;
};
