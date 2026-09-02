export const PLAYER_DIRECTIONS = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
} as const;

export type PlayerDirection =
    (typeof PLAYER_DIRECTIONS)[keyof typeof PLAYER_DIRECTIONS];
