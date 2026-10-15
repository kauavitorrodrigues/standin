import type { Seat, SeatFacing } from "../types/seat";

export const withFacing = (
    seats: Seat[],
    index: number,
    facing: SeatFacing
): Seat[] =>
    seats.map((seat, at) => (at === index ? { ...seat, facing } : seat));

export const withoutSeat = (seats: Seat[], index: number): Seat[] =>
    seats.filter((_, at) => at !== index);
