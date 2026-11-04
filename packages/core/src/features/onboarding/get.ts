import { UserNotFoundError, type OnboardingResponse } from "@standin/contracts";
import { OnboardingRepository } from "./repository";
import { parseOnboardingTasks } from "./utils/parseOnboardingTasks";

export const getOnboarding = async (
    userId: string
): Promise<OnboardingResponse> => {
    const raw = await OnboardingRepository.findTasks(userId);
    if (raw === null) throw new UserNotFoundError();

    return { tasks: parseOnboardingTasks(raw) };
};
