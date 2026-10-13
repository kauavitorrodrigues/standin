import type { SEAT_FACINGS } from "@standin/contracts";

export type SeatFacing = (typeof SEAT_FACINGS)[keyof typeof SEAT_FACINGS];

// Pixels from the left of the frame (dx) and from the bottom of the frame
// (dy), the same way the footprint is counted from the bottom.
export type Seat = { dx: number; dy: number; facing: SeatFacing };
