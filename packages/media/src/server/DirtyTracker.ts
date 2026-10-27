import { expandDirtySet, type NeighbourIndex } from "../planner/expandDirtySet";
import type { CurrentConsumer } from "../planner/types";

/**
 * Keeps, for each space, who the planner has to look at on the next tick, so
 * it never runs for the whole space on every tick.
 *
 * Two kinds of mark exist. A person who "moved" (or started, stopped or
 * changed what they send) changes the surroundings of everybody near them, so
 * the mark is expanded to the neighbourhood when taken. A "receiver" mark only
 * asks for the plan of that person to be computed again.
 *
 * @example
 * const tracker = createDirtyTracker();
 * tracker.markMoved("space-1", "socket-a");
 * const dirty = tracker.take("space-1", index, currentConsumers, 150);
 */
export const createDirtyTracker = () => {
    const moved = new Map<string, Set<string>>();
    const receivers = new Map<string, Set<string>>();

    const bucket = (store: Map<string, Set<string>>, spaceId: string) => {
        const existing = store.get(spaceId);
        if (existing) return existing;
        const created = new Set<string>();
        store.set(spaceId, created);
        return created;
    };

    return {
        markMoved: (spaceId: string, id: string): void => {
            bucket(moved, spaceId).add(id);
        },
        markReceivers: (spaceId: string, ids: Iterable<string>): void => {
            const target = bucket(receivers, spaceId);
            for (const id of ids) target.add(id);
        },
        /**
         * Empties what was pending for the space and returns it expanded: the
         * movers, everyone within `radius` of them and everyone who consumes
         * them right now, plus the plain receivers.
         */
        take: (
            spaceId: string,
            index: NeighbourIndex,
            current: ReadonlyMap<string, readonly CurrentConsumer[]>,
            radius: number
        ): Set<string> => {
            const movedIds = moved.get(spaceId);
            const receiverIds = receivers.get(spaceId);
            moved.delete(spaceId);
            receivers.delete(spaceId);

            const dirty = movedIds
                ? expandDirtySet(movedIds, index, current, radius)
                : new Set<string>();
            receiverIds?.forEach((id) => dirty.add(id));
            return dirty;
        },
        hasPending: (spaceId: string): boolean =>
            (moved.get(spaceId)?.size ?? 0) > 0 ||
            (receivers.get(spaceId)?.size ?? 0) > 0,
        forget: (spaceId: string): void => {
            moved.delete(spaceId);
            receivers.delete(spaceId);
        },
    };
};

export type DirtyTracker = ReturnType<typeof createDirtyTracker>;
