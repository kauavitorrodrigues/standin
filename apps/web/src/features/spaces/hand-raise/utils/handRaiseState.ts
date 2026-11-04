import type { HandRaiseAction, HandRaiseState } from "../types/handRaise";

export const INITIAL_HAND_RAISE_STATE: HandRaiseState = {
    hands: [],
    raisedSince: null,
};

export const handRaiseReducer = (
    state: HandRaiseState,
    action: HandRaiseAction
): HandRaiseState => {
    switch (action.type) {
        case "hands-received":
            return { ...state, hands: action.hands };
        case "own-state-set":
            return { ...state, raisedSince: action.raisedSince };
        case "reset":
            return INITIAL_HAND_RAISE_STATE;
    }
};
