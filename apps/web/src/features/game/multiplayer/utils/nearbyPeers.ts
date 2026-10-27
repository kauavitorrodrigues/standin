import type { ProximityRadii } from "./proximityRadii";

/**
 * Who stands close enough to show on the stage, nearest first.
 * - a person joins when inside the enter radius
 * - a person already shown stays until beyond the exit radius, so standing
 *   on the border does not flicker
 * - at most `limit` people
 */
export const selectNearbyPeers = (
    distances: ReadonlyMap<string, number>,
    current: ReadonlySet<string>,
    limit: number,
    { enterRadius, exitRadius }: ProximityRadii
): string[] =>
    [...distances.entries()]
        .filter(
            ([id, distance]) =>
                distance <= (current.has(id) ? exitRadius : enterRadius)
        )
        .sort(([, first], [, second]) => first - second)
        .slice(0, limit)
        .map(([id]) => id);
