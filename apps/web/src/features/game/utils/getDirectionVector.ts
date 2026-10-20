import { PLAYER_DIRECTIONS, type PlayerDirection } from "@standin/contracts";

// The step, in tiles, that one move in the direction takes.
export const getDirectionVector = (
    direction: PlayerDirection
): { x: number; y: number } => {
    switch (direction) {
        case PLAYER_DIRECTIONS.UP:
            return { x: 0, y: -1 };
        case PLAYER_DIRECTIONS.DOWN:
            return { x: 0, y: 1 };
        case PLAYER_DIRECTIONS.LEFT:
            return { x: -1, y: 0 };
        case PLAYER_DIRECTIONS.RIGHT:
            return { x: 1, y: 0 };
    }
};
