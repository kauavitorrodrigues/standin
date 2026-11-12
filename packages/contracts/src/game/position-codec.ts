import { SPACE_TELEPORT_COUNT_MAX } from "./consts/realtime";
import { PLAYER_DIRECTIONS, type PlayerDirection } from "./enums/player";
import type { PlayerPosition } from "./types/player";

// The wire form of a position inside a batch: a short id the space gave the
// person, x, y and one number for the direction and the sitting and dancing bits. Much
// smaller than an object with four named keys or a 20 char socket id, and a
// space sends many of these every tick.
export type PositionTuple = [
    shortId: number,
    x: number,
    y: number,
    flags: number,
];

// A position the receiver has not heard about yet. It also carries the socket
// id, which is how the receiver learns what the short id stands for.
export type EnteredTuple = [...PositionTuple, socketId: string];

const DIRECTION_ORDER: PlayerDirection[] = [
    PLAYER_DIRECTIONS.UP,
    PLAYER_DIRECTIONS.DOWN,
    PLAYER_DIRECTIONS.LEFT,
    PLAYER_DIRECTIONS.RIGHT,
];

const DIRECTION_MASK = 0b11;
const SITTING_BIT = 0b100;
const DANCING_BIT = 0b1000;
// The jump counter sits above the bits of the state, so a receiver that does
// not know it reads the same direction and bits and only sees a larger number.
const TELEPORT_SHIFT = 4;

// A count the wire can carry: a whole number from 0 to the maximum, or 0.
const sanitizeTeleportCount = (count: number | undefined): number => {
    if (count === undefined || !Number.isInteger(count)) return 0;
    if (count < 0 || count > SPACE_TELEPORT_COUNT_MAX) return 0;
    return count;
};

export const encodePositionFlags = (
    direction: PlayerDirection,
    isSitting: boolean,
    isDancing: boolean,
    teleportCount?: number
): number => {
    const index = DIRECTION_ORDER.indexOf(direction);
    const stateBits =
        Number(isDancing) * DANCING_BIT +
        Number(isSitting) * SITTING_BIT +
        sanitizeTeleportCount(teleportCount) * (1 << TELEPORT_SHIFT);
    // A direction the order does not know reads as right, like the decoder.
    if (index < 0) return stateBits | 1;

    return stateBits | index;
};

export const decodePositionFlags = (
    flags: number
): Pick<
    PlayerPosition,
    "direction" | "isSitting" | "isDancing" | "teleportCount"
> => ({
    direction:
        DIRECTION_ORDER[flags & DIRECTION_MASK] ?? PLAYER_DIRECTIONS.DOWN,
    isSitting: (flags & SITTING_BIT) !== 0,
    isDancing: (flags & DANCING_BIT) !== 0,
    teleportCount: sanitizeTeleportCount(flags >> TELEPORT_SHIFT),
});

export const encodePosition = (
    shortId: number,
    position: PlayerPosition
): PositionTuple => [
    shortId,
    position.x,
    position.y,
    encodePositionFlags(
        position.direction,
        position.isSitting,
        position.isDancing,
        position.teleportCount
    ),
];

export const encodeEnteredPosition = (
    shortId: number,
    socketId: string,
    position: PlayerPosition
): EnteredTuple => [...encodePosition(shortId, position), socketId];

// A count of 0 is left out, which is how a position without one reads.
export const decodePosition = (
    tuple: PositionTuple | EnteredTuple
): { shortId: number; position: PlayerPosition } => {
    const { teleportCount = 0, ...state } = decodePositionFlags(tuple[3]);
    return {
        shortId: tuple[0],
        position: {
            x: tuple[1],
            y: tuple[2],
            ...state,
            ...(teleportCount > 0 ? { teleportCount } : {}),
        },
    };
};
