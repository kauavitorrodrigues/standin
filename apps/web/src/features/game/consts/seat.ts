import { PLAYER_DIRECTIONS, SEAT_FACINGS } from "@standin/contracts";
import type { PlayerDirection } from "@standin/contracts";

// The way a seat faces is the way the avatar looks once seated.
export const SEAT_FACING_DIRECTIONS: Record<
    (typeof SEAT_FACINGS)[keyof typeof SEAT_FACINGS],
    PlayerDirection
> = {
    [SEAT_FACINGS.UP]: PLAYER_DIRECTIONS.UP,
    [SEAT_FACINGS.DOWN]: PLAYER_DIRECTIONS.DOWN,
    [SEAT_FACINGS.LEFT]: PLAYER_DIRECTIONS.LEFT,
    [SEAT_FACINGS.RIGHT]: PLAYER_DIRECTIONS.RIGHT,
};
