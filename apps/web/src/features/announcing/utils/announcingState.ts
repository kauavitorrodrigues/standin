import type { AnnouncingAction, AnnouncingState } from "../types/announcing";

export const INITIAL_ANNOUNCING_STATE: AnnouncingState = {
    announcers: [],
    announcingSince: null,
    sharingVideoSince: null,
};

export const announcingReducer = (
    state: AnnouncingState,
    action: AnnouncingAction
): AnnouncingState => {
    switch (action.type) {
        case "announcers-received":
            // The server ends the sharing when nobody announces near me, so
            // the button goes back to its first state at the same time.
            if (action.announcers.length === 0) {
                return {
                    ...state,
                    announcers: action.announcers,
                    sharingVideoSince: null,
                };
            }
            return { ...state, announcers: action.announcers };
        case "video-sharing-set":
            return { ...state, sharingVideoSince: action.sharingVideoSince };
        case "own-state-set":
            return { ...state, announcingSince: action.announcingSince };
        case "reset":
            return INITIAL_ANNOUNCING_STATE;
    }
};
