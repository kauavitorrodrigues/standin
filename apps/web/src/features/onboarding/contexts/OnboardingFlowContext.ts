import { createContext } from "react";
import type { OnboardingFlowControls } from "../types/flow";

// Without a provider nothing opens, so a screen without onboarding is not
// affected by a hook that asks for it.
const NO_FLOW: OnboardingFlowControls = {
    active: null,
    isActive: () => false,
    open: () => undefined,
    close: () => undefined,
};

export const OnboardingFlowContext =
    createContext<OnboardingFlowControls>(NO_FLOW);
