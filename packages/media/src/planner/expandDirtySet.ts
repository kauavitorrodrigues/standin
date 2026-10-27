import type { CurrentConsumer } from "./types";

// Read side of the SpatialGrid, structural so SpatialGrid fits as it is.
export type NeighbourIndex = {
    get(id: string): { x: number; y: number } | undefined;
    query(x: number, y: number, radius: number): string[];
};

// Turns the people who moved into the receivers whose neighbourhood changed:
// the mover, everyone within the exit radius of the new spot, and everyone
// who consumes the mover right now (they may have just been left behind).
export const expandDirtySet = (
    movedIds: Iterable<string>,
    index: NeighbourIndex,
    current: ReadonlyMap<string, readonly CurrentConsumer[]>,
    radius: number
): Set<string> => {
    const moved = new Set(movedIds);
    const dirty = new Set(moved);

    moved.forEach((id) => {
        const spot = index.get(id);
        if (!spot) return;
        index.query(spot.x, spot.y, radius).forEach((near) => dirty.add(near));
    });

    current.forEach((consumers, receiverId) => {
        if (consumers.some((consumer) => moved.has(consumer.personId))) {
            dirty.add(receiverId);
        }
    });

    return dirty;
};
