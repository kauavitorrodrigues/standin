import type { OnboardingTaskKey } from "@standin/contracts";
import type {
    ONBOARDING_FLOW_ACTIONS,
    ONBOARDING_FLOW_KINDS,
} from "../consts/flow";

type FlowKind =
    (typeof ONBOARDING_FLOW_KINDS)[keyof typeof ONBOARDING_FLOW_KINDS];

export type OnboardingFlow =
    | { kind: typeof ONBOARDING_FLOW_KINDS.CHECKLIST }
    | { kind: typeof ONBOARDING_FLOW_KINDS.TASK; taskKey: OnboardingTaskKey }
    | { kind: typeof ONBOARDING_FLOW_KINDS.DESK_GUIDE };

// Only one flow is on screen at a time.
export type OnboardingFlowState = { active: OnboardingFlow | null };

export type OnboardingFlowAction =
    | { type: typeof ONBOARDING_FLOW_ACTIONS.OPEN; flow: OnboardingFlow }
    | { type: typeof ONBOARDING_FLOW_ACTIONS.CLOSE };

// `isUnmounting` tells a flow that was closed or replaced apart from one that
// ended because the screen went away: undoing something on a screen that is
// gone (a highlight, a panel) must be skipped.
export type OnboardingFlowEnd = { isUnmounting: boolean };

export type OnboardingFlowOptions = {
    // Runs when the flow ends for any reason, so a contextual flow can undo
    // what it prepared in the space (a highlight, an open panel).
    onEnd?: (end: OnboardingFlowEnd) => void;
};

export type OnboardingFlowControls = {
    active: OnboardingFlow | null;
    isActive: (kind: FlowKind) => boolean;
    open: (flow: OnboardingFlow, options?: OnboardingFlowOptions) => void;
    close: () => void;
};
