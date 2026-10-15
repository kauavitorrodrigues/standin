import type { Seat, SeatFacing } from "../types/seat";

export const withFacing = (
    seats: Seat[],
    index: number,
    facing: SeatFacing
): Seat[] =>
    seats.map((seat, at) => (at === index ? { ...seat, facing } : seat));

export const withoutSeat = (seats: Seat[], index: number): Seat[] =>
    seats.filter((_, at) => at !== index);

// The seats that still sit inside the frame, for when the crop or the frames
// of the strip change under them.
export const keepSeatsInFrame = (
    seats: Seat[],
    frame: { w: number; h: number }
): Seat[] =>
    seats.filter(
        (seat) =>
            seat.dx >= 0 &&
            seat.dx <= frame.w &&
            seat.dy >= 0 &&
            seat.dy <= frame.h
    );
