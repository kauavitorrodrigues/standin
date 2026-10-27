import type { Peer } from "../spaceTypes";
import { canReceive } from "./peerQueries";

export type SplitReceivers = {
    // Ready to be planned now, by quality.
    normal: Set<string>;
    low: Set<string>;
    // Still applying the previous plan, kept for the next tick.
    busy: string[];
};

// Sorts the dirty people into who can be planned now and who has to wait.
export const splitReceivers = (
    dirtyIds: ReadonlySet<string>,
    peers: ReadonlyMap<string, Peer>
): SplitReceivers => {
    const split: SplitReceivers = {
        normal: new Set(),
        low: new Set(),
        busy: [],
    };

    dirtyIds.forEach((id) => {
        const peer = peers.get(id);
        if (!peer || !canReceive(peer)) return;
        if (peer.applying) {
            split.busy.push(id);
            return;
        }
        if (peer.lowQuality) {
            split.low.add(id);
            return;
        }
        split.normal.add(id);
    });
    return split;
};
