import { PLAYER_DIRECTIONS, type PlayerPosition } from "@standin/contracts";

const DIRECTIONS = new Set<string>(Object.values(PLAYER_DIRECTIONS));

// Position updates arrive over the raw WebRTC data channel, never validated
// server-side (the server never inspects peer traffic by design), so a
// malicious or buggy peer can send anything - guard before it reaches the
// scene.
export const isPlayerPosition = (data: unknown): data is PlayerPosition => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.x === "number" &&
        typeof candidate.y === "number" &&
        typeof candidate.isSitting === "boolean" &&
        typeof candidate.direction === "string" &&
        DIRECTIONS.has(candidate.direction)
    );
};
