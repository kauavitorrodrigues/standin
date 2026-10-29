type Point = { x: number; y: number };

// A seated avatar sits exactly on the spot, so this only absorbs the rounding
// of the position that travels over the network.
const SEAT_MATCH_TOLERANCE_PX = 4;

// An avatar on its feet stands on the seat when it is this close to it. Wider
// than the match of a seated one, since the feet rest on the cell and not on
// the exact point of the seat.
export const STANDING_ON_SEAT_RADIUS_PX = 12;

// Whether one of the points, the seated avatars, is on the seat. The
// tolerance is wider for avatars that are not sat.
export const isSeatTaken = (
    seat: Point,
    seatedPoints: Iterable<Point>,
    tolerance: number = SEAT_MATCH_TOLERANCE_PX
): boolean => {
    for (const point of seatedPoints) {
        const distance = Math.hypot(seat.x - point.x, seat.y - point.y);
        if (distance <= tolerance) return true;
    }
    return false;
};
