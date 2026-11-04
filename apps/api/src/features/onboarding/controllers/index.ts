import { getOnboarding } from "./get";
import { markOnboardingTask } from "./markTask";

export const OnboardingController = {
    get: getOnboarding,
    markTask: markOnboardingTask,
};
