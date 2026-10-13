import type { Seat } from "../types/seat";
import type { Crop } from "../types/spriteGeometry";

type Point = { x: number; y: number };

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

// A point inside the first frame, in image px, as the offsets of a seat.
export const getSeatOffsets = (
    point: Point,
    frame: Crop
): Pick<Seat, "dx" | "dy"> => ({
    dx: Math.round(clamp(point.x - frame.x, frame.w)),
    dy: Math.round(clamp(frame.y + frame.h - point.y, frame.h)),
});

// Where the seat is drawn, in image px.
export const getSeatPoint = (seat: Seat, frame: Crop): Point => ({
    x: frame.x + seat.dx,
    y: frame.y + frame.h - seat.dy,
});

// The seat closest to a point, when it is within `radius` px.
export const findSeatAt = (
    seats: Seat[],
    point: Point,
    frame: Crop,
    radius: number
): number => {
    let found = -1;
    let best = radius;
    seats.forEach((seat, index) => {
        const at = getSeatPoint(seat, frame);
        const distance = Math.hypot(at.x - point.x, at.y - point.y);
        if (distance <= best) {
            best = distance;
            found = index;
        }
    });
    return found;
};
