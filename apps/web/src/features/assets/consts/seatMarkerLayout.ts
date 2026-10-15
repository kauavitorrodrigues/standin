import { SEAT_FACINGS } from "@standin/contracts";

// How a seat is drawn for each direction: the turn of the arrow and which
// corner holds the number, always the one away from the arrow.
export const SEAT_MARKER_LAYOUT = {
    [SEAT_FACINGS.UP]: { angle: 0, badge: { x: 13, y: 13 } },
    [SEAT_FACINGS.RIGHT]: { angle: 90, badge: { x: -13, y: -13 } },
    [SEAT_FACINGS.DOWN]: { angle: 180, badge: { x: 13, y: -13 } },
    [SEAT_FACINGS.LEFT]: { angle: 270, badge: { x: 13, y: 13 } },
} as const;
