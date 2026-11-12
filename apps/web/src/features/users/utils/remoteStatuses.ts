import { AVAILABILITIES } from "@standin/contracts";
import type {
    RemoteStatus,
    RemoteStatusAction,
    SaidStatus,
    SaidStatuses,
} from "../types/availability";

// People who say nothing are left out, so an empty map is the common case.
export const INITIAL_SAID_STATUSES: SaidStatuses = new Map();

const NOTHING_SAID = {
    availability: AVAILABILITIES.ACTIVE,
    customStatus: null,
} as const;

const saysNothing = ({ availability, customStatus }: SaidStatus): boolean =>
    availability === NOTHING_SAID.availability && customStatus === null;

const withStatus = (
    previous: SaidStatuses,
    userId: string,
    said: SaidStatus
): SaidStatuses => {
    const next = new Map(previous);
    if (saysNothing(said)) next.delete(userId);
    else next.set(userId, said);
    return next;
};

// A server older than the client sends neither field, and the person then
// says nothing.
const pick = (source: Partial<SaidStatus>): SaidStatus => ({
    availability: source.availability ?? AVAILABILITIES.ACTIVE,
    customStatus: source.customStatus ?? null,
});

export const remoteStatusReducer = (
    state: SaidStatuses,
    action: RemoteStatusAction
): SaidStatuses => {
    switch (action.type) {
        case "snapshot-received":
            return action.peers.reduce(
                (next, peer) => withStatus(next, peer.userId, pick(peer)),
                INITIAL_SAID_STATUSES
            );
        case "peer-joined":
            return withStatus(state, action.peer.userId, pick(action.peer));
        case "status-received":
            return withStatus(
                state,
                action.payload.userId,
                pick(action.payload)
            );
        case "peer-left": {
            if (!state.has(action.userId)) return state;

            const next = new Map(state);
            next.delete(action.userId);
            return next;
        }
        case "reset":
            return INITIAL_SAID_STATUSES;
    }
};

/**
 * What the others see: the status each person said, with busy worked out from
 * the headphones. Busy beats away, as it does for the local person.
 */
export const mergeRemoteStatuses = (
    said: SaidStatuses,
    headphonesUserIds: Iterable<string>
): ReadonlyMap<string, RemoteStatus> => {
    const merged = new Map<string, RemoteStatus>();
    said.forEach((status, userId) => merged.set(userId, status));
    for (const userId of headphonesUserIds) {
        merged.set(userId, {
            availability: AVAILABILITIES.BUSY,
            customStatus: merged.get(userId)?.customStatus ?? null,
        });
    }
    return merged;
};
