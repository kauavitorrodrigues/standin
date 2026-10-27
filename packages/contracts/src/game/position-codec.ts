import { PLAYER_DIRECTIONS, type PlayerDirection } from "./enums/player";
import type { PlayerPosition } from "./types/player";

// The wire form of a position inside a batch: a short id the space gave the
// person, x, y and one number for the direction and the sitting bit. Much
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

export const encodePositionFlags = (
    direction: PlayerDirection,
    isSitting: boolean
): number => {
    const index = DIRECTION_ORDER.indexOf(direction);
    return (isSitting ? SITTING_BIT : 0) | (index < 0 ? 1 : index);
};

export const decodePositionFlags = (
    flags: number
): Pick<PlayerPosition, "direction" | "isSitting"> => ({
    direction: DIRECTION_ORDER[flags & DIRECTION_MASK] ?? PLAYER_DIRECTIONS.DOWN,
    isSitting: (flags & SITTING_BIT) !== 0,
});

export const encodePosition = (
    shortId: number,
    position: PlayerPosition
): PositionTuple => [
    shortId,
    position.x,
    position.y,
    encodePositionFlags(position.direction, position.isSitting),
];

export const encodeEnteredPosition = (
    shortId: number,
    socketId: string,
    position: PlayerPosition
): EnteredTuple => [...encodePosition(shortId, position), socketId];

export const decodePosition = (
    tuple: PositionTuple | EnteredTuple
): { shortId: number; position: PlayerPosition } => ({
    shortId: tuple[0],
    position: {
        x: tuple[1],
        y: tuple[2],
        ...decodePositionFlags(tuple[3]),
    },
});
