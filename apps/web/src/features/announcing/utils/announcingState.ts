import type { AnnouncingAction, AnnouncingState } from "../types/announcing";

export const INITIAL_ANNOUNCING_STATE: AnnouncingState = {
    announcers: [],
    announcingSince: null,
};

export const announcingReducer = (
    state: AnnouncingState,
    action: AnnouncingAction
): AnnouncingState => {
    switch (action.type) {
        case "announcers-received":
            return { ...state, announcers: action.announcers };
        case "own-state-set":
            return { ...state, announcingSince: action.announcingSince };
        case "reset":
            return INITIAL_ANNOUNCING_STATE;
    }
};
