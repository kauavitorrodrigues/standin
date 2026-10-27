import type { MediaSource } from "@standin/contracts";

/** A video stream somebody sends, and how many people receive it now. */
export type DemandEntry = {
    peerId: string;
    source: MediaSource;
    consumerCount: number;
};

type DemandState = { wanted: boolean; idleSince: number | null };

/** The remembered demand of each stream, by `peerId:source`. */
export type DemandBook = Map<string, DemandState>;

export type DemandChange = {
    peerId: string;
    source: MediaSource;
    wanted: boolean;
};

const keyOf = (entry: Pick<DemandEntry, "peerId" | "source">): string =>
    `${entry.peerId}:${entry.source}`;

/**
 * Decides which senders have to be told to stop or start encoding.
 *
 * A stream is wanted while somebody receives it. When nobody does, it is only
 * called unwanted after it stayed that way for `idleMs`, so a person who walks
 * in and out of range does not make the sender flap. It is wanted again the
 * moment somebody receives it. A stream starts as wanted, because the sender
 * starts encoding on its own.
 *
 * Mutates `book` and returns only what changed.
 */
export const nextDemand = (
    entries: readonly DemandEntry[],
    book: DemandBook,
    now: number,
    idleMs: number
): DemandChange[] => {
    const changes: DemandChange[] = [];
    const seen = new Set<string>();

    entries.forEach((entry) => {
        const key = keyOf(entry);
        seen.add(key);
        const state = book.get(key) ?? { wanted: true, idleSince: null };
        book.set(key, state);

        if (entry.consumerCount > 0) {
            state.idleSince = null;
            if (!state.wanted) {
                state.wanted = true;
                changes.push({
                    peerId: entry.peerId,
                    source: entry.source,
                    wanted: true,
                });
            }
            return;
        }

        state.idleSince ??= now;
        if (state.wanted && now - state.idleSince >= idleMs) {
            state.wanted = false;
            changes.push({
                peerId: entry.peerId,
                source: entry.source,
                wanted: false,
            });
        }
    });

    // A stream that no longer exists is forgotten.
    [...book.keys()].forEach((key) => {
        if (!seen.has(key)) book.delete(key);
    });
    return changes;
};
