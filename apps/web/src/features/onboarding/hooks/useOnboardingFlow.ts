import { useContext } from "react";
import { OnboardingFlowContext } from "../contexts/OnboardingFlowContext";

export const useOnboardingFlow = () => useContext(OnboardingFlowContext);
