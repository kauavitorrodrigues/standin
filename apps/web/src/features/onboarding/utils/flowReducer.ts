import { ONBOARDING_FLOW_ACTIONS } from "../consts/flow";
import type { OnboardingFlowAction, OnboardingFlowState } from "../types/flow";

export const INITIAL_FLOW_STATE: OnboardingFlowState = { active: null };

// Opening a flow replaces the one on screen, so cards never pile up.
export function flowReducer(
    state: OnboardingFlowState,
    action: OnboardingFlowAction
): OnboardingFlowState {
    switch (action.type) {
        case ONBOARDING_FLOW_ACTIONS.OPEN:
            return { active: action.flow };
        case ONBOARDING_FLOW_ACTIONS.CLOSE:
            if (state.active === null) return state;
            return INITIAL_FLOW_STATE;
    }
}
