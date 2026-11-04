import { getOnboarding } from "./get";
import { markOnboardingTask } from "./markTask";

export const OnboardingService = {
    get: getOnboarding,
    markTask: markOnboardingTask,
};
