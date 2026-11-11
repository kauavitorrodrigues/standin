import type { ListeningAction, ListeningState } from "../types/listening";

export const INITIAL_LISTENING_STATE: ListeningState = {};

const withoutUser = (state: ListeningState, userId: string) => {
    if (!(userId in state)) return state;

    const { [userId]: _removed, ...rest } = state;
    return rest;
};

export const listeningReducer = (
    state: ListeningState,
    action: ListeningAction
): ListeningState => {
    switch (action.type) {
        case "snapshot-received":
            return Object.fromEntries(
                action.entries.map((entry) => [entry.userId, entry.track])
            );
        case "track-received":
            if (action.track === null) return withoutUser(state, action.userId);
            return { ...state, [action.userId]: action.track };
        case "reset":
            return INITIAL_LISTENING_STATE;
    }
};
