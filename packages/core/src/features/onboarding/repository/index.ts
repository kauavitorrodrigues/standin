import { findOnboardingTasks } from "./findTasks";
import { markOnboardingTask } from "./markTask";

export const OnboardingRepository = {
    findTasks: findOnboardingTasks,
    markTask: markOnboardingTask,
};
