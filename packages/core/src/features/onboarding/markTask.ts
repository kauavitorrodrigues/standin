import {
    OnboardingTaskKeySchema,
    UnknownOnboardingTaskError,
    type OnboardingResponse,
} from "@standin/contracts";
import { getOnboarding } from "./get";
import { OnboardingRepository } from "./repository";
import { parseOnboardingTasks } from "./utils/parseOnboardingTasks";

// Marking twice is not an error: the first `completedAt` stays.
export const markOnboardingTask = async (
    userId: string,
    taskKey: string
): Promise<OnboardingResponse> => {
    const key = OnboardingTaskKeySchema.safeParse(taskKey);
    if (!key.success) throw new UnknownOnboardingTaskError();

    const raw = await OnboardingRepository.markTask(
        userId,
        key.data,
        new Date()
    );
    if (raw !== null) return { tasks: parseOnboardingTasks(raw) };

    // Nothing changed: already marked, or the person does not exist.
    return getOnboarding(userId);
};
